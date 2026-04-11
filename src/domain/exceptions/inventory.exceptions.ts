export class InventoryException extends Error {
  public readonly errorCode: string;

  constructor(message: string, errorCode: string) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NegativeStockException extends InventoryException {
  constructor(productId: number, requested: number, available: number) {
    super(
      `Insufficient stock for product ID ${productId}. Requested: ${requested}, Available: ${available}`,
      "NEGATIVE_STOCK",
    );
  }
}
