
export function buildQuestionGenPrompt({
  level,
  role,
  companyType,
  roundType,
  difficulty,
  topic,
  previousTopics = [],
  timeLimit,
}) {
  return `You are a Senior Engineer creating interview questions for a ${level.replace('_', '-')} ${role.replace('_', ' ')} candidate targeting ${companyType} companies.

Generate a ${difficulty} ${roundType.replace(/_/g, ' ')} question${topic ? ` on the topic: ${topic}` : ''}.

${previousTopics.length > 0 ? `Do NOT repeat these already asked topics: ${previousTopics.join(', ')}` : ''}

The question must:
- Be realistic and commonly asked at ${companyType} companies
- Be solvable in ${timeLimit} minutes
- Have clear, unambiguous problem statement
- Include concrete examples with input/output (for DSA)
- Be appropriate for ${level.replace('_', '-')} level difficulty

Return ONLY valid JSON:
{
  "question": "<full question text with examples>",
  "difficulty": "${difficulty}",
  "topic": "<specific topic tag>",
  "timeLimit": ${timeLimit},
  "hints": [
    "<hint 1 — very gentle, just direction>",
    "<hint 2 — slightly more specific>",
    "<hint 3 — approach-oriented hint>",
    "<hint 4 — very specific technical hint>",
    "<hint 5 — almost gives away the solution>"
  ],
  "testCases": [
    { "input": "<input>", "output": "<expected output>", "explanation": "<why>" },
    { "input": "<edge case>", "output": "<output>", "explanation": "<why>" }
  ],
  "sampleAnswer": "<Model answer or solution>",
  "evaluationCriteria": ["<what to check when evaluating>"]
}`;
}

export function buildGenericEvalPrompt({ question, answer, roundType }) {
  return `You are a Senior Engineer evaluating a candidate's answer for a ${roundType.replace(/_/g, ' ')} round.

QUESTION:
${question}

CANDIDATE'S ANSWER:
${answer}

Evaluate comprehensively. Return ONLY valid JSON:
{
  "totalScore": <number 0-100>,
  "breakdown": {
    "accuracy": <0-40>,
    "depth": <0-25>,
    "clarity": <0-20>,
    "practicalKnowledge": <0-15>
  },
  "strengths": ["<specific strengths>"],
  "improvements": ["<specific improvements>"],
  "missedTopics": ["<important topics not covered>"],
  "modelAnswer": "<Comprehensive model answer>",
  "verdict": "<Excellent|Good|Average|Poor>"
}`;
}
