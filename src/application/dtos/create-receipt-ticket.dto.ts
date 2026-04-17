import { AddReceiptLineDto } from "./add-receipt-line.dto";

export class CreateReceiptTicketDto {
  note?: string;
  lines: AddReceiptLineDto[];
}
