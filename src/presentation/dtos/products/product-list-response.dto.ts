import { ApiProperty } from "@nestjs/swagger";
import { ProductResponseDto } from "./product-response.dto";

class ProductPaginationMetaDto {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 5 })
  lastPage: number;
}

export class PaginatedProductResponseDto {
  @ApiProperty({ type: [ProductResponseDto] })
  data: ProductResponseDto[];

  @ApiProperty({ type: ProductPaginationMetaDto })
  metadata: ProductPaginationMetaDto;
}
