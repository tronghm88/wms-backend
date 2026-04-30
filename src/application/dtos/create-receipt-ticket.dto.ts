import { AddReceiptLineDto } from "./add-receipt-line.dto";

export class CreateReceiptTicketDto {
  note?: string;
  supplierName?: string;
  invoiceNo?: string;
  invoiceDate?: Date;
  lines: AddReceiptLineDto[];
}
