import { ApiProperty } from "@nestjs/swagger";
import { IssueTicketResponseDto } from "./issue-ticket-response.dto";

class PaginationMetaDto {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  lastPage: number;
}

export class PaginatedIssueTicketResponseDto {
  @ApiProperty({ type: [IssueTicketResponseDto] })
  data: IssueTicketResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  metadata: PaginationMetaDto;
}
