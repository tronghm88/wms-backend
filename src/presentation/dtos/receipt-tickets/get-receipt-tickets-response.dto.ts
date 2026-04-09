import { ApiProperty } from "@nestjs/swagger";
import { ReceiptTicketResponseDto } from "../receipt-ticket-response.dto";

class ReceiptTicketsMetaDto {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  lastPage: number;
}

export class GetReceiptTicketsResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ type: [ReceiptTicketResponseDto] })
  data: ReceiptTicketResponseDto[];

  @ApiProperty()
  meta: ReceiptTicketsMetaDto;
}
