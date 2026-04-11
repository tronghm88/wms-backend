import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IssueTicketStatus } from "../../../domain/enums";
import { IssueTicketEntity } from "../../../domain/entities/issue-ticket.entity";

export class IssueTicketResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "PX-202604-1" })
  code: string;

  @ApiProperty({ example: "2026-04-11T10:00:00Z" })
  date: Date;

  @ApiProperty({ enum: IssueTicketStatus, example: IssueTicketStatus.DRAFT })
  status: IssueTicketStatus;

  @ApiProperty({ example: 1 })
  customerId: number;

  @ApiProperty({ example: 1 })
  createdBy: number;

  @ApiProperty({ example: "1500.000" })
  totalAmount: string;

  @ApiPropertyOptional({ example: "Monthly supply" })
  note?: string;

  @ApiProperty({ example: "2026-04-11T10:00:00Z" })
  createdAt: Date;

  @ApiProperty({ example: "2026-04-11T10:00:00Z" })
  updatedAt: Date;

  constructor(entity: IssueTicketEntity) {
    this.id = entity.id;
    this.code = entity.code;
    this.date = entity.date;
    this.status = entity.status;
    this.customerId = entity.customerId;
    this.createdBy = entity.createdBy;
    this.totalAmount = entity.totalAmount.toString();
    this.note = entity.note;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}
