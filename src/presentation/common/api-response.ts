import { ApiProperty } from "@nestjs/swagger";

export class ApiResponse<T> {
  @ApiProperty({ example: "success", enum: ["success", "failed"] })
  status: "success" | "failed";

  @ApiProperty({ nullable: true })
  data: T | null;

  @ApiProperty({ nullable: true, example: null })
  error: string | null;

  @ApiProperty({ nullable: true, example: null })
  metadata: Record<string, unknown> | null;

  @ApiProperty({ nullable: true, type: [String], example: null })
  messages: string[] | null;

  private constructor(partial: ApiResponse<T>) {
    Object.assign(this, partial);
  }

  static success<T>(
    data: T | null = null,
    metadata: Record<string, unknown> | null = null,
    messages: string[] | null = null,
  ): ApiResponse<T> {
    return new ApiResponse<T>({
      status: "success",
      data,
      error: null,
      metadata,
      messages,
    });
  }

  static failed(
    error: string,
    messages: string[] | null = null,
  ): ApiResponse<null> {
    return new ApiResponse<null>({
      status: "failed",
      data: null,
      error,
      metadata: null,
      messages,
    });
  }
}

/** Shape controllers must return for paginated list responses */
export interface PaginatedResult<T> {
  data: T[];
  metadata: Record<string, unknown>;
}
