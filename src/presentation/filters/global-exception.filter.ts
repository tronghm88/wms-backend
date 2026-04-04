import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isDomainException = (ex: unknown): boolean => {
      return (
        ex instanceof Error &&
        "errorCode" in ex &&
        typeof (ex as Record<string, unknown>).errorCode === "string"
      );
    };

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = "Internal server error";
    let errorCode: string | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (isDomainException(exception)) {
      errorCode = (exception as Record<string, unknown>).errorCode as string;
      message = (exception as Error).message;

      // Map common domain error codes to HTTP status codes
      if (
        errorCode?.includes("ALREADY_EXISTS") ||
        errorCode?.includes("CONFLICT")
      ) {
        status = HttpStatus.CONFLICT;
      } else if (errorCode?.includes("NOT_FOUND")) {
        status = HttpStatus.NOT_FOUND;
      } else if (errorCode?.includes("HAS_")) {
        status = HttpStatus.UNPROCESSABLE_ENTITY;
      } else if (
        errorCode?.includes("INVALID") ||
        errorCode?.includes("REQUIRED") ||
        errorCode?.includes("CANNOT")
      ) {
        status = HttpStatus.BAD_REQUEST;
      } else if (
        errorCode?.includes("UNAUTHORIZED") ||
        errorCode?.includes("CREDENTIALS")
      ) {
        status = HttpStatus.UNAUTHORIZED;
      } else if (errorCode?.includes("FORBIDDEN")) {
        status = HttpStatus.FORBIDDEN;
      } else {
        status = HttpStatus.BAD_REQUEST;
      }
    }

    const getMessage = (msg: string | object): string => {
      if (typeof msg === "string") return msg;
      if (typeof msg === "object" && msg !== null && "message" in msg) {
        const m = (msg as { message: unknown }).message;
        return Array.isArray(m) ? m.join(", ") : String(m);
      }
      return JSON.stringify(msg);
    };

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: getMessage(message),
      ...(errorCode ? { errorCode } : {}),
    };

    if (Number(status) === (HttpStatus.INTERNAL_SERVER_ERROR as number)) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error
          ? exception.stack
          : JSON.stringify(exception),
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - Status: ${status} - Message: ${JSON.stringify(message)}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
