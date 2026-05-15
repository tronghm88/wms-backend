import { ApiProperty } from "@nestjs/swagger";
import { IssueTicketListItemResponseDto } from "./issue-ticket-list-item-response.dto";

class PaginationMetaDto {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  lastPage: number;
}

export class PaginatedIssueTicketResponseDto {
  @ApiProperty({ type: [IssueTicketListItemResponseDto] })
  data: IssueTicketListItemResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  metadata: PaginationMetaDto;
}
