import { ApiProperty } from "@nestjs/swagger";
import { ReceiptTicketResponseDto } from "../receipt-ticket-response.dto";

class PaginationMetaDto {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  lastPage: number;
}

export class PaginatedReceiptTicketResponseDto {
  @ApiProperty({ type: [ReceiptTicketResponseDto] })
  data: ReceiptTicketResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  metadata: PaginationMetaDto;
}
