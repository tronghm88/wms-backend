import { ApiProperty } from "@nestjs/swagger";
import { TransactionStatus } from "../../../domain/enums";
import { SplitTicketEntity } from "../../../domain/entities/split-ticket.entity";

export class SplitTicketResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "ST-202604-1" })
  ticketNo: string;

  @ApiProperty({ example: "2026-04-16T10:00:00Z" })
  date: Date;

  @ApiProperty({ enum: TransactionStatus, example: TransactionStatus.DRAFT })
  status: TransactionStatus;

  @ApiProperty({ example: 1 })
  createdBy: number;

  @ApiProperty({ example: 1 })
  sourceProductId: number;

  @ApiProperty({ example: "100.000", description: "Decimal stored as string" })
  sourceQty: string;

  @ApiProperty({ example: "m2" })
  sourceUnitCode: string;

  @ApiProperty({ example: "Optional note", required: false })
  note?: string;

  @ApiProperty({ example: "2026-04-16T10:00:00Z" })
  createdAt: Date;

  @ApiProperty({ example: "2026-04-16T10:00:00Z" })
  updatedAt: Date;

  constructor(entity: SplitTicketEntity) {
    this.id = entity.id;
    this.ticketNo = entity.ticketNo;
    this.date = entity.date;
    this.status = entity.status;
    this.createdBy = entity.createdBy;
    this.sourceProductId = entity.sourceProductId;
    this.sourceQty = entity.sourceQty.toString();
    this.sourceUnitCode = entity.sourceUnitCode;
    this.note = entity.note;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}
