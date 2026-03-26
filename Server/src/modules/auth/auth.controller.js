/**
 * Auth controller — HTTP request handlers.
 */
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import * as authService from './auth.service.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

/**
 * POST /api/v1/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.registerUser({
    name,
    email,
    password,
  });

  res
    .status(201)
    .cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    .json(new ApiResponse(201, { user, accessToken }, 'Registration successful'));
});

/**
 * POST /api/v1/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.loginUser({
    email,
    password,
  });

  res
    .status(200)
    .cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    .json(new ApiResponse(200, { user, accessToken }, 'Login successful'));
});

/**
 * POST /api/v1/auth/refresh
 * Reads refresh token from httpOnly cookie.
 */
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    throw ApiError.unauthorized('Refresh token is required');
  }

  const { accessToken, refreshToken } = await authService.refreshTokens(token);

  res
    .status(200)
    .cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    .json(new ApiResponse(200, { accessToken }, 'Token refreshed'));
});

/**
 * POST /api/v1/auth/logout
 * Revokes refresh token and clears cookie.
 */
export const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user.id);

  res
    .status(200)
    .clearCookie('refreshToken', COOKIE_OPTIONS)
    .json(new ApiResponse(200, null, 'Logged out successfully'));
});

/**
 * GET /api/v1/auth/me
 * Returns the currently authenticated user.
 */
export const getMe = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, { user: req.user }));
});
