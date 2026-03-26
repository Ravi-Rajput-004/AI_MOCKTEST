/**
 * Standardized API success response wrapper.
 * All successful responses go through this class for consistency.
 */
export class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code (2xx)
   * @param {*} data - Response payload
   * @param {string} [message='Success'] - Human-readable message
   */
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }

  /** 200 OK */
  static ok(data, message = 'Success') {
    return new ApiResponse(200, data, message);
  }

  /** 201 Created */
  static created(data, message = 'Created successfully') {
    return new ApiResponse(201, data, message);
  }

  /** 204 No Content */
  static noContent(message = 'Deleted successfully') {
    return new ApiResponse(204, null, message);
  }
}
