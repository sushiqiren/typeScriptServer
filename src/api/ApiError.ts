/**
 * Base class for API errors
 */
export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request - User provided invalid input
 */
export class BadRequestError extends ApiError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

/**
 * 401 Unauthorized - Authentication is required
 */
export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

/**
 * 403 Forbidden - User doesn't have permission
 */
export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

/**
 * 404 Not Found - Resource doesn't exist
 */
export class NotFoundError extends ApiError {
  constructor(message = "Not Found") {
    super(message, 404);
  }
}