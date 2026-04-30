import { ApiProperty } from "@nestjs/swagger";
import { SplitTicketResponseDto } from "./split-ticket-response.dto";
import { SplitTicketEntity } from "../../../domain/entities/split-ticket.entity";

export class CancelSplitTicketResponseDto extends SplitTicketResponseDto {
  @ApiProperty({
    example: [
      "Child product 10 stock has already been consumed. Current: 5.000, Reverting: 10.000",
    ],
    description: "Warnings if child stock has been partially consumed",
    required: false,
  })
  warnings: string[];

  constructor(entity: SplitTicketEntity, warnings: string[]) {
    super(entity);
    this.warnings = warnings;
  }
}
