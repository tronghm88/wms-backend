import { ApiProperty } from "@nestjs/swagger";
import { TransactionStatus } from "../../../domain/enums";
import { SplitTicketEntity } from "../../../domain/entities/split-ticket.entity";
import { SplitTicketLineEntity } from "../../../domain/entities/split-ticket-line.entity";

export class SplitTicketLineResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  targetProductId: number;

  @ApiProperty({ example: "10.500" })
  quantity: string;

  @ApiProperty({ example: "m2" })
  unitCode: string;

  @ApiProperty({ example: false })
  isNewProduct: boolean;

  @ApiProperty({ example: "Line note", required: false })
  note?: string | null;

  constructor(line: SplitTicketLineEntity) {
    this.id = line.id;
    this.targetProductId = line.targetProductId;
    this.quantity = line.quantity.toFixed(3);
    this.unitCode = line.unitCode;
    this.isNewProduct = line.isNewProduct;
    this.note = line.note;
  }
}

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

  @ApiProperty({ example: "John Doe", required: false })
  createdByName?: string;

  @ApiProperty({ example: "PRD-001", required: false })
  sourceProductCode?: string;

  @ApiProperty({ example: "Steel Pipe", required: false })
  sourceProductName?: string;

  @ApiProperty({ example: "Square Meter", required: false })
  sourceUnitLabel?: string;

  @ApiProperty({ type: [SplitTicketLineResponseDto], required: false })
  lines?: SplitTicketLineResponseDto[];

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
    this.sourceQty = entity.sourceQty.toFixed(3);
    this.sourceUnitCode = entity.sourceUnitCode;
    this.note = entity.note;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;

    // List view metadata
    if (entity.createdByName !== undefined) {
      this.createdByName = entity.createdByName;
    }
    if (entity.sourceProductCode !== undefined) {
      this.sourceProductCode = entity.sourceProductCode;
    }
    if (entity.sourceProductName !== undefined) {
      this.sourceProductName = entity.sourceProductName;
    }
    if (entity.sourceUnitLabel !== undefined) {
      this.sourceUnitLabel = entity.sourceUnitLabel;
    }
    if (entity.lines) {
      this.lines = entity.lines.map((l) => new SplitTicketLineResponseDto(l));
    }
  }
}
