/**
 * Interview routes — /api/v1/interview
 */
import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { answerLimiter, hintLimiter } from '../../middleware/rateLimit.middleware.js';
import {
  createSessionSchema,
  startRoundSchema,
  submitAnswerSchema,
  skipQuestionSchema,
  completeRoundSchema,
  completeSessionSchema,
  updateSessionSchema,
  historyQuerySchema,
} from './interview.schema.js';
import * as controller from './interview.controller.js';

const router = Router();

// All interview routes require authentication
router.use(requireAuth);

// Session management
router.post('/session', validate(createSessionSchema), controller.createSession);
router.get('/session/:id', controller.getSession);
router.patch('/session/:id', validate(updateSessionSchema), controller.updateSession);
router.delete('/session/:id', controller.deleteSession);

// Round flow
router.post('/round/start', validate(startRoundSchema), controller.startRound);
router.post('/round/complete', validate(completeRoundSchema), controller.completeRound);

// Question flow
router.post('/answer', answerLimiter, validate(submitAnswerSchema), controller.submitAnswer);
router.get('/hint/:questionId', hintLimiter, controller.getHint);
router.post('/skip', validate(skipQuestionSchema), controller.skipQuestion);

// Session completion & results
router.post('/complete', validate(completeSessionSchema), controller.completeSessionCtrl);
router.get('/results/:sessionId', controller.getResults);
router.get('/history', validate(historyQuerySchema, 'query'), controller.getHistory);

export default router;
