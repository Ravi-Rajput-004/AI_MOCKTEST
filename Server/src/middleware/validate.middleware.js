/**
 * Zod validation middleware.
 * Validates request body, query, and params against Zod schemas.
 * Returns 400 with detailed validation errors on failure.
 */
import { ApiError } from '../utils/ApiError.js';

/**
 * Creates validation middleware for the given Zod schema.
 * @param {import('zod').ZodType} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} [source='body'] - Which part of the request to validate
 * @returns {import('express').RequestHandler}
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      return next(new ApiError(400, 'Validation failed', errors));
    }

    // Replace the source data with the parsed (and potentially transformed) data
    req[source] = result.data;
    next();
  };
};
