import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ApiResponse, PaginatedResult } from "../common/api-response";

function isPaginatedResult(value: unknown): value is PaginatedResult<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    Array.isArray((value as PaginatedResult<unknown>).data) &&
    "metadata" in value &&
    typeof (value as PaginatedResult<unknown>).metadata === "object"
  );
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const httpResponse = context.switchToHttp().getResponse<{
      statusCode: number;
    }>();

    return next.handle().pipe(
      map((data: unknown) => {
        // 204 No Content — keep body empty by returning null-wrapped envelope
        // NestJS will still send the body, so we instead normalise 204 → 200 in
        // each controller. This guard is kept as a safety net.
        if (httpResponse.statusCode === 204) {
          return ApiResponse.success<T>(null);
        }

        // Paginated shape: { data: T[], metadata: {...} }
        if (isPaginatedResult(data)) {
          return ApiResponse.success<T>(data.data as T, data.metadata);
        }

        return ApiResponse.success<T>(data === undefined ? null : (data as T));
      }),
    );
  }
}
