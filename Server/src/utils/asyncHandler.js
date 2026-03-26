/**
 * Async handler wrapper for Express route handlers.
 * Catches async errors and forwards them to the error middleware,
 * eliminating the need for try-catch in every controller.
 *
 * @param {Function} fn - Async Express route handler
 * @returns {Function} Wrapped handler
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
