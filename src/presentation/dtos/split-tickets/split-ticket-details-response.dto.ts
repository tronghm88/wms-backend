import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TransactionStatus } from "../../../domain/enums";
import { GetSplitTicketUseCaseOutput } from "../../../application/use-cases/split-tickets/get-split-ticket.use-case";
import { SplitTicketLineEntity } from "../../../domain/entities/split-ticket-line.entity";

export class SplitTicketDetailLineResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  ticketId: number;

  @ApiProperty({ example: 42 })
  targetProductId: number;

  @ApiProperty({ example: "10.500", description: "Decimal stored as string" })
  quantity: string;

  @ApiProperty({ example: "m2" })
  unitCode: string;

  @ApiProperty({ example: false })
  isNewProduct: boolean;

  @ApiPropertyOptional({ example: "Line note", nullable: true })
  note?: string | null;

  @ApiPropertyOptional({ example: "Product B" })
  targetProductName?: string;

  @ApiPropertyOptional({ example: "1.200", description: "Width in meters" })
  productWidth?: string;

  @ApiPropertyOptional({ example: "50.000", description: "Length in meters" })
  productLength?: string;

  @ApiPropertyOptional({ example: "0.300", description: "Height in meters" })
  productHeight?: string;

  @ApiPropertyOptional({ example: "Square Meter" })
  unitLabel?: string;

  @ApiProperty({ example: "2026-04-16T10:00:00Z" })
  createdAt: Date;

  @ApiProperty({ example: "2026-04-16T10:00:00Z" })
  updatedAt: Date;

  constructor(line: SplitTicketLineEntity) {
    this.id = line.id;
    this.ticketId = line.ticketId;
    this.targetProductId = line.targetProductId;
    this.quantity = line.quantity.toFixed(3);
    this.unitCode = line.unitCode;
    this.isNewProduct = line.isNewProduct;
    this.note = line.note;
    this.targetProductName = line.targetProductName;
    this.productWidth = line.productWidth?.toFixed(3);
    this.productLength = line.productLength?.toFixed(3);
    this.productHeight = line.productHeight?.toFixed(3);
    this.unitLabel = line.unitLabel;
    this.createdAt = line.createdAt;
    this.updatedAt = line.updatedAt;
  }
}

export class SplitTicketDetailsResponseDto {
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

  @ApiProperty({ example: 10 })
  sourceProductId: number;

  @ApiProperty({ example: "100.000", description: "Decimal stored as string" })
  sourceQty: string;

  @ApiProperty({ example: "m2" })
  sourceUnitCode: string;

  @ApiPropertyOptional({ example: "Optional note", nullable: true })
  note?: string;

  @ApiPropertyOptional({ example: "John Doe" })
  createdByName?: string;

  @ApiPropertyOptional({ example: "PRD-001" })
  sourceProductCode?: string;

  @ApiPropertyOptional({ example: "Steel Pipe" })
  sourceProductName?: string;

  @ApiPropertyOptional({ example: "Square Meter" })
  sourceUnitLabel?: string;

  @ApiProperty({
    example: "50.000",
    description: "Total quantity across all lines",
  })
  totalSplitQty: string;

  @ApiProperty({ example: 2 })
  linesCount: number;

  @ApiProperty({ type: [SplitTicketDetailLineResponseDto] })
  lines: SplitTicketDetailLineResponseDto[];

  @ApiProperty({ example: "2026-04-16T10:00:00Z" })
  createdAt: Date;

  @ApiProperty({ example: "2026-04-16T10:00:00Z" })
  updatedAt: Date;

  constructor(output: GetSplitTicketUseCaseOutput) {
    this.id = output.id;
    this.ticketNo = output.ticketNo;
    this.date = output.date;
    this.status = output.status;
    this.createdBy = output.createdBy;
    this.sourceProductId = output.sourceProductId;
    this.sourceQty = output.sourceQty.toFixed(3);
    this.sourceUnitCode = output.sourceUnitCode;
    this.note = output.note;
    this.createdByName = output.createdByName;
    this.sourceProductCode = output.sourceProductCode;
    this.sourceProductName = output.sourceProductName;
    this.sourceUnitLabel = output.sourceUnitLabel;
    this.totalSplitQty = output.totalSplitQty
      ? output.totalSplitQty.toFixed(3)
      : "0.000";
    this.linesCount = output.lines.length;
    this.lines = output.lines.map(
      (line) => new SplitTicketDetailLineResponseDto(line),
    );
    this.createdAt = output.createdAt;
    this.updatedAt = output.updatedAt;
  }
}
