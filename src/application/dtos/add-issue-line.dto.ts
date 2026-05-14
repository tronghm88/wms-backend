export class AddIssueLineDto {
  productId: number;
  quantity: number;
  unitCode: string;
  manualPrice?: number;
  note?: string;
}
