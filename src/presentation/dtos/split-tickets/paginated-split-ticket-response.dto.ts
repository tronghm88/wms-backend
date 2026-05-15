import { ApiProperty } from "@nestjs/swagger";
import { SplitTicketResponseDto } from "./split-ticket-response.dto";

class PaginationMetaDto {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 5 })
  lastPage: number;
}

export class PaginatedSplitTicketResponseDto {
  @ApiProperty({ type: [SplitTicketResponseDto] })
  data: SplitTicketResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  metadata: PaginationMetaDto;
}
