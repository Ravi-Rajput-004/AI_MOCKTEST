import { Worker } from 'bullmq';
import { getRedisConnection } from '../config/queue.js';
import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';
import * as aiService from '../modules/ai/ai.service.js';

let worker = null;

async function processEvaluationJob(job) {
  const {
    questionId, roundType, questionContent,
    answer, codeAnswer, language, difficulty, sessionId,
  } = job.data;

  logger.info(`Processing evaluation job: question=${questionId}`);

  let evaluation = null;

  try {
    if (['DSA_BASIC', 'DSA_MEDIUM', 'DSA_HARD'].includes(roundType)) {
      evaluation = await aiService.evaluateDSA({
        question: questionContent,
        code: codeAnswer || answer || '',
        language: language || 'javascript',
        difficulty: difficulty || 'Medium',
      });
    } else if (['HR', 'BEHAVIOURAL', 'HIRING_MANAGER'].includes(roundType)) {
      evaluation = await aiService.evaluateHR({
        question: questionContent,
        answer: answer || '',
      });
    } else if (roundType === 'LLD') {
      evaluation = await aiService.evaluateLLD({
        question: questionContent,
        answer: codeAnswer || answer || '',
      });
    } else {
      evaluation = await aiService.evaluateGeneric({
        question: questionContent,
        answer: answer || '',
        roundType,
      });
    }
  } catch (err) {
    logger.error(`AI evaluation failed for ${questionId}: ${err.message}`);
    evaluation = {
      totalScore: 0,
      error: 'AI evaluation temporarily unavailable. Your answer has been saved.',
      verdict: 'Pending',
    };
  }

  await prisma.question.update({
    where: { id: questionId },
    data: {
      aiEvaluation: evaluation,
      score: evaluation.totalScore || 0,
      answeredAt: new Date(),
    },
  });

  return { questionId, sessionId, evaluation };
}

function startEvaluationWorker(io) {
  const connection = getRedisConnection();
  if (!connection) {
    logger.warn('Evaluation worker disabled — no Redis');
    return null;
  }

  worker = new Worker('ai-evaluation', processEvaluationJob, {
    connection,
    concurrency: 3,
    lockDuration: 60000,
    stalledInterval: 30000,
  });

  worker.on('completed', (job, result) => {
    logger.info(`Evaluation job completed: question=${result.questionId}`);
    if (io) {
      io.to(`interview:${result.sessionId}`).emit('interview:evaluation_done', {
        questionId: result.questionId,
        evaluation: result.evaluation,
        score: result.evaluation?.totalScore || 0,
        feedback: result.evaluation?.positiveFeedback || result.evaluation?.verdict || '',
        nextAction: 'continue',
      });
    }
  });

  worker.on('failed', (job, err) => {
    logger.error(`Evaluation job failed: ${job?.id} — ${err.message}`);
    const data = job?.data;
    if (data && io) {
      io.to(`interview:${data.sessionId}`).emit('interview:evaluation_done', {
        questionId: data.questionId,
        evaluation: { totalScore: 0, verdict: 'Pending', error: 'Evaluation failed after retries' },
        score: 0,
        feedback: 'AI evaluation failed. Your answer has been saved.',
        nextAction: 'continue',
      });
    }
  });

  worker.on('stalled', (jobId) => {
    logger.warn(`Evaluation job stalled: ${jobId}`);
  });

  logger.info('✅ Evaluation worker started');
  return worker;
}

function getEvaluationWorker() {
  return worker;
}

export { startEvaluationWorker, getEvaluationWorker };
