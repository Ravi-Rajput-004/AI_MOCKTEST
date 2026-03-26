import { Worker } from 'bullmq';
import { getRedisConnection } from '../config/queue.js';
import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';
import * as aiService from '../modules/ai/ai.service.js';
import {
  ADAPTIVE_THRESHOLDS,
  DIFFICULTY_PROGRESSION,
  ROUND_DIFFICULTY_RANGE,
} from '../modules/interview/rounds/roundConfig.js';

let worker = null;

function getFallbackContent(roundType, topic, questionNumber) {
  const pools = {
    APTITUDE: [
      'A train travels 60 km in 40 minutes. What is its speed in km/h?',
      'If 8 workers can complete a task in 12 days, how many days will 6 workers take?',
      'What is the probability of getting a sum of 7 when two dice are thrown?',
      'A shopkeeper marks up goods by 40% and offers 20% discount. Find profit %.',
      'In how many ways can 5 people be seated in a row?',
    ],
    TECH_FUNDAMENTALS: [
      'Explain the difference between stack and heap memory allocation.',
      'What are the SOLID principles? Explain each with examples.',
      'Describe how garbage collection works in modern programming languages.',
      'What is the difference between concurrency and parallelism?',
      'Explain the CAP theorem and its implications for distributed systems.',
    ],
    DSA_BASIC: [
      'Implement a function to reverse a linked list.',
      'Write a function to check if a string is a valid palindrome.',
      'Implement binary search on a sorted array.',
      'Write a function to find the maximum subarray sum.',
      'Implement a stack using two queues.',
    ],
    DSA_MEDIUM: [
      'Implement an LRU Cache with O(1) get and put operations.',
      'Find the longest substring without repeating characters.',
      'Serialize and deserialize a binary tree.',
      'Find all paths from root to leaf that sum to a target.',
      'Implement a trie with insert, search, and startsWith methods.',
    ],
    DSA_HARD: [
      'Design a data structure that supports insert, delete, getRandom in O(1).',
      'Find the median of two sorted arrays in O(log(m+n)) time.',
      'Implement a solution for the N-Queens problem.',
      'Find the shortest path in a weighted graph with negative edges.',
      'Design an algorithm to solve the word break problem with backtracking.',
    ],
    LLD: [
      'Design a parking lot system with multiple floors and vehicle types.',
      'Design a library management system with borrowing and reservation.',
      'Design a food delivery app like Swiggy/Zomato.',
      'Design an elevator system for a high-rise building.',
      'Design a movie ticket booking system like BookMyShow.',
    ],
    HLD: [
      'Design a URL shortener like bit.ly that handles millions of requests.',
      'Design a real-time chat system like WhatsApp.',
      'Design a video streaming platform like YouTube.',
      'Design a ride-sharing service like Uber.',
      'Design a social media feed system like Twitter.',
    ],
    HR: [
      'Tell me about a time you had a conflict with a team member.',
      'Describe a situation where you had to meet a tight deadline.',
      'What is your biggest professional achievement?',
      'How do you handle criticism from your manager?',
      'Where do you see yourself in 5 years?',
    ],
    BEHAVIOURAL: [
      'Describe a time when you took ownership of a failing project.',
      'Tell me about a decision you made that was unpopular.',
      'How do you prioritize tasks when everything is urgent?',
      'Describe a time you had to learn something completely new quickly.',
      'Tell me about a time you went above and beyond for a customer.',
    ],
  };

  const questions = pools[roundType] || pools.TECH_FUNDAMENTALS;
  return questions[(questionNumber - 1) % questions.length];
}

async function processGenerationJob(job) {
  const {
    roundId, questionNumber, sessionId, level, role,
    companyType, roundType, difficulty, topic,
    previousTopics, timeLimit, questionType,
  } = job.data;

  logger.info(`Processing generation job: round=${roundId} q=${questionNumber}`);

  let adaptedDifficulty = difficulty;
  try {
    const allowedRange = ROUND_DIFFICULTY_RANGE[roundType] || [difficulty];
    if (allowedRange.length > 1 && questionNumber > ADAPTIVE_THRESHOLDS.minQuestionsForAdaptation) {
      const answered = await prisma.question.findMany({
        where: { roundId, score: { not: null } },
        select: { score: true, metadata: true },
        orderBy: { questionNumber: 'asc' },
      });
      if (answered.length >= ADAPTIVE_THRESHOLDS.minQuestionsForAdaptation) {
        const avgScore = answered.reduce((s, q) => s + (q.score || 0), 0) / answered.length;
        const lastDiff = answered[answered.length - 1]?.metadata?.difficulty || difficulty;
        const prog = DIFFICULTY_PROGRESSION[lastDiff] || DIFFICULTY_PROGRESSION.Medium;
        if (avgScore >= ADAPTIVE_THRESHOLDS.upgradeThreshold) adaptedDifficulty = prog.up;
        else if (avgScore <= ADAPTIVE_THRESHOLDS.downgradeThreshold) adaptedDifficulty = prog.down;
        else adaptedDifficulty = lastDiff;
        if (!allowedRange.includes(adaptedDifficulty)) adaptedDifficulty = lastDiff;
        logger.info(`Adaptive: round=${roundId} q=${questionNumber} avg=${avgScore.toFixed(1)} ${lastDiff}→${adaptedDifficulty}`);
      }
    }
  } catch (err) {
    logger.warn(`Adaptive difficulty fallback: ${err.message}`);
  }

  let content;
  let metadata = {
    difficulty: adaptedDifficulty,
    topic,
    hints: ['Think about the basic approach first', 'Consider edge cases', 'Optimize your solution'],
    testCases: [],
    sampleAnswer: '',
    evaluationCriteria: ['Correctness', 'Code quality', 'Efficiency'],
    timeLimit,
  };

  try {
    const generated = await aiService.generateQuestion({
      level, role, companyType, roundType,
      difficulty: adaptedDifficulty, topic,
      previousTopics: previousTopics || [],
      timeLimit,
    });

    content = generated.question || generated.content || `Question ${questionNumber}`;
    metadata = {
      difficulty: generated.difficulty || difficulty,
      topic: generated.topic || topic,
      hints: generated.hints || metadata.hints,
      testCases: generated.testCases || [],
      sampleAnswer: generated.sampleAnswer || '',
      evaluationCriteria: generated.evaluationCriteria || metadata.evaluationCriteria,
      timeLimit: generated.timeLimit || timeLimit,
    };
  } catch (err) {
    logger.error(`AI generation failed for q${questionNumber}: ${err.message}`);
    content = getFallbackContent(roundType, topic, questionNumber);
  }

  const question = await prisma.question.create({
    data: {
      roundId,
      questionNumber,
      type: questionType,
      content,
      metadata,
    },
  });

  return { question, sessionId, roundId, questionNumber };
}

function startGenerationWorker(io) {
  const connection = getRedisConnection();
  if (!connection) {
    logger.warn('Generation worker disabled — no Redis');
    return null;
  }

  worker = new Worker('ai-generation', processGenerationJob, {
    connection,
    concurrency: 3,
    lockDuration: 30000,
    stalledInterval: 15000,
  });

  worker.on('completed', (job, result) => {
    logger.info(`Generation job completed: q=${result.questionNumber} for round=${result.roundId}`);
    if (io) {
      io.to(`interview:${result.sessionId}`).emit('interview:question_ready', {
        question: result.question,
        roundId: result.roundId,
        questionNumber: result.questionNumber,
      });
    }
  });

  worker.on('failed', (job, err) => {
    logger.error(`Generation job failed: ${job?.id} — ${err.message}`);
  });

  worker.on('stalled', (jobId) => {
    logger.warn(`Generation job stalled: ${jobId}`);
  });

  logger.info('✅ Generation worker started');
  return worker;
}

function getGenerationWorker() {
  return worker;
}

export { startGenerationWorker, getGenerationWorker };
