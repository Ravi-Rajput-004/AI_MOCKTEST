import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import * as adminService from './admin.service.js';

export const getStats = asyncHandler(async (req, res) => {
  const [stats, popularRounds] = await Promise.all([
    adminService.getPlatformStats(),
    adminService.getPopularRounds(),
  ]);
  res.json(new ApiResponse(200, { ...stats, popularRounds }));
});

export const getUserGrowth = asyncHandler(async (req, res) => {
  const data = await adminService.getUserGrowth();
  res.json(new ApiResponse(200, data));
});

export const getRevenue = asyncHandler(async (req, res) => {
  const data = await adminService.getRevenueBreakdown();
  res.json(new ApiResponse(200, data));
});

export const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const search = req.query.search || '';
  const data = await adminService.getAdminUsers(page, limit, search);
  res.json(new ApiResponse(200, data));
});
