import { ApiProperty } from "@nestjs/swagger";
import { IssueTicketResponseDto } from "./issue-ticket-response.dto";
import { IssueTicketEntity } from "../../../domain/entities/issue-ticket.entity";

export class CancelIssueTicketResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: IssueTicketResponseDto })
  data: IssueTicketResponseDto;

  @ApiProperty({
    type: [String],
    example: ["Negative stock for product P001: -5.000"],
  })
  warnings: string[];

  constructor(ticket: IssueTicketEntity, warnings: string[]) {
    this.success = true;
    this.data = new IssueTicketResponseDto(ticket);
    this.warnings = warnings;
  }
}
