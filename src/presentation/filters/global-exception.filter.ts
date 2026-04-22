import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { ApiResponse } from "../common/api-response";

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
    let errorCode = "INTERNAL_SERVER_ERROR";
    let messages: string[] = ["Internal server error"];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const httpResponse = exception.getResponse();

      if (typeof httpResponse === "string") {
        errorCode = httpResponse;
        messages = [httpResponse];
      } else if (typeof httpResponse === "object" && httpResponse !== null) {
        const res = httpResponse as Record<string, unknown>;
        const resError = typeof res.error === "string" ? res.error : undefined;

        // class-validator produces { message: string[] | string, error: string }
        if ("message" in res) {
          const msg = res.message;
          if (Array.isArray(msg)) {
            messages = msg.map(String);
            // Multiple validation messages → generic error label
            errorCode =
              messages.length > 1
                ? "Validation failed"
                : (resError ?? "Bad Request");
          } else {
            messages = [String(msg)];
            errorCode = resError ?? "Bad Request";
          }
        } else {
          messages = [JSON.stringify(httpResponse)];
          errorCode = resError ?? "HttpException";
        }
      }
    } else if (isDomainException(exception)) {
      errorCode = (exception as Record<string, unknown>).errorCode as string;
      messages = [(exception as Error).message];

      if (
        errorCode.includes("ALREADY_EXISTS") ||
        errorCode.includes("CONFLICT")
      ) {
        status = HttpStatus.CONFLICT;
      } else if (errorCode.includes("NOT_FOUND")) {
        status = HttpStatus.NOT_FOUND;
      } else if (errorCode.includes("HAS_")) {
        status = HttpStatus.UNPROCESSABLE_ENTITY;
      } else if (
        errorCode.includes("INVALID") ||
        errorCode.includes("REQUIRED") ||
        errorCode.includes("CANNOT")
      ) {
        status = HttpStatus.BAD_REQUEST;
      } else if (
        errorCode.includes("UNAUTHORIZED") ||
        errorCode.includes("CREDENTIALS")
      ) {
        status = HttpStatus.UNAUTHORIZED;
      } else if (errorCode.includes("FORBIDDEN")) {
        status = HttpStatus.FORBIDDEN;
      } else {
        status = HttpStatus.BAD_REQUEST;
      }
    }

    const body = ApiResponse.failed(errorCode, messages);

    if (Number(status) === (HttpStatus.INTERNAL_SERVER_ERROR as number)) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error
          ? exception.stack
          : JSON.stringify(exception),
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - Status: ${status} - Error: ${errorCode} - Messages: ${messages.join(", ")}`,
      );
    }

    response.status(status).json(body);
  }
}
