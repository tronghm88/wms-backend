import { ProductEntity } from "./product.entity";
import { SplitTicketEntity } from "./split-ticket.entity";

export class ProductLineageEntity {
  currentProduct: ProductEntity;
  parent?: {
    product: ProductEntity;
    splitTicket: SplitTicketEntity;
  };
  children: {
    product: ProductEntity;
    splitTicket?: SplitTicketEntity;
  }[];

  constructor(partial?: Partial<ProductLineageEntity>) {
    Object.assign(this, partial);
    if (partial?.currentProduct) {
      this.currentProduct = new ProductEntity(partial.currentProduct);
    }
    if (partial?.parent) {
      this.parent = {
        product: new ProductEntity(partial.parent.product),
        splitTicket: new SplitTicketEntity(partial.parent.splitTicket),
      };
    }
    if (partial?.children) {
      this.children = partial.children.map((c) => ({
        product: new ProductEntity(c.product),
        splitTicket: c.splitTicket
          ? new SplitTicketEntity(c.splitTicket)
          : undefined,
      }));
    } else {
      this.children = [];
    }
  }
}
