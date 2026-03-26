/**
 * Interview controller — HTTP request handlers.
 */
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import * as interviewService from './interview.service.js';

/** POST /api/v1/interview/session */
export const createSession = asyncHandler(async (req, res) => {
  const session = await interviewService.createSession(req.user.id, req.body);
  res.status(201).json(new ApiResponse(201, session, 'Interview session created'));
});

/** GET /api/v1/interview/session/:id */
export const getSession = asyncHandler(async (req, res) => {
  const session = await interviewService.getSession(req.params.id, req.user.id);
  res.json(new ApiResponse(200, session));
});

/** PATCH /api/v1/interview/session/:id */
export const updateSession = asyncHandler(async (req, res) => {
  const session = await interviewService.updateSessionStatus(req.params.id, req.user.id, req.body.status);
  res.json(new ApiResponse(200, session, 'Session updated'));
});

/** DELETE /api/v1/interview/session/:id */
export const deleteSession = asyncHandler(async (req, res) => {
  await interviewService.deleteSession(req.params.id, req.user.id);
  res.json(new ApiResponse(200, null, 'Session deleted'));
});

/** POST /api/v1/interview/round/start */
export const startRound = asyncHandler(async (req, res) => {
  const result = await interviewService.startRound(req.body.sessionId, req.body.roundNumber, req.user.id);
  res.json(new ApiResponse(200, result, 'Round started'));
});

/** POST /api/v1/interview/answer */
export const submitAnswer = asyncHandler(async (req, res) => {
  const result = await interviewService.submitAnswer(req.body, req.user.id);
  res.json(new ApiResponse(200, result, 'Answer evaluated'));
});

/** GET /api/v1/interview/hint/:questionId */
export const getHint = asyncHandler(async (req, res) => {
  const result = await interviewService.getHint(req.params.questionId, req.user.id, req.user.plan, req.user.isAdmin);
  res.json(new ApiResponse(200, result));
});

/** POST /api/v1/interview/skip */
export const skipQuestion = asyncHandler(async (req, res) => {
  const question = await interviewService.skipQuestion(req.body.questionId, req.user.id);
  res.json(new ApiResponse(200, question, 'Question skipped'));
});

/** POST /api/v1/interview/round/complete */
export const completeRound = asyncHandler(async (req, res) => {
  const result = await interviewService.completeRound(req.body.sessionId, req.body.roundId, req.user.id);
  res.json(new ApiResponse(200, result, 'Round completed'));
});

/** POST /api/v1/interview/complete */
export const completeSessionCtrl = asyncHandler(async (req, res) => {
  const result = await interviewService.completeSession(req.body.sessionId, req.user.id);
  res.json(new ApiResponse(200, result, 'Interview completed'));
});

/** GET /api/v1/interview/results/:sessionId */
export const getResults = asyncHandler(async (req, res) => {
  const result = await interviewService.getResults(req.params.sessionId, req.user.id);
  res.json(new ApiResponse(200, result));
});

/** GET /api/v1/interview/history */
export const getHistory = asyncHandler(async (req, res) => {
  const result = await interviewService.getHistory(req.user.id, req.query);
  res.json(new ApiResponse(200, result));
});
