import { ApiProperty } from "@nestjs/swagger";
import { ProductResponseDto } from "./product-response.dto";
import { SplitTicketResponseDto } from "../split-tickets/split-ticket-response.dto";
import { ProductLineageEntity } from "../../../domain/entities/product-lineage.entity";

export class ProductLineageEntryDto {
  @ApiProperty({ type: ProductResponseDto })
  product: ProductResponseDto;

  @ApiProperty({
    type: SplitTicketResponseDto,
    required: false,
    nullable: true,
  })
  splitTicket?: SplitTicketResponseDto;

  constructor(
    product: ProductResponseDto,
    splitTicket?: SplitTicketResponseDto,
  ) {
    this.product = product;
    this.splitTicket = splitTicket;
  }
}

export class ProductLineageResponseDto {
  @ApiProperty({ type: ProductResponseDto })
  currentProduct: ProductResponseDto;

  @ApiProperty({
    type: ProductLineageEntryDto,
    required: false,
    nullable: true,
  })
  parent?: ProductLineageEntryDto;

  @ApiProperty({ type: [ProductLineageEntryDto] })
  children: ProductLineageEntryDto[];

  constructor(entity: ProductLineageEntity) {
    this.currentProduct = {
      id: entity.currentProduct.id,
      code: entity.currentProduct.code,
      name: entity.currentProduct.name,
      categoryId: entity.currentProduct.categoryId,
      categoryName: entity.currentProduct.categoryName,
      baseUnit: entity.currentProduct.baseUnit,
      basePrice: entity.currentProduct.basePrice.toFixed(3),
      costPrice: entity.currentProduct.costPrice?.toFixed(3),
      reorderThreshold: entity.currentProduct.reorderThreshold.toFixed(3),
      description: entity.currentProduct.description ?? undefined,
      specText: entity.currentProduct.specText ?? undefined,
      length: entity.currentProduct.length?.toFixed(3) ?? null,
      width: entity.currentProduct.width?.toFixed(3) ?? null,
      height: entity.currentProduct.height?.toFixed(3) ?? null,
      parentProductId: entity.currentProduct.parentProductId,
      createdAt: entity.currentProduct.createdAt,
      updatedAt: entity.currentProduct.updatedAt,
    };

    if (entity.parent) {
      this.parent = new ProductLineageEntryDto(
        {
          id: entity.parent.product.id,
          code: entity.parent.product.code,
          name: entity.parent.product.name,
          categoryId: entity.parent.product.categoryId,
          categoryName: entity.parent.product.categoryName,
          baseUnit: entity.parent.product.baseUnit,
          basePrice: entity.parent.product.basePrice.toFixed(3),
          costPrice: entity.parent.product.costPrice?.toFixed(3),
          reorderThreshold: entity.parent.product.reorderThreshold.toFixed(3),
          description: entity.parent.product.description ?? undefined,
          specText: entity.parent.product.specText ?? undefined,
          length: entity.parent.product.length?.toFixed(3) ?? null,
          width: entity.parent.product.width?.toFixed(3) ?? null,
          height: entity.parent.product.height?.toFixed(3) ?? null,
          parentProductId: entity.parent.product.parentProductId,
          createdAt: entity.parent.product.createdAt,
          updatedAt: entity.parent.product.updatedAt,
        },
        new SplitTicketResponseDto(entity.parent.splitTicket),
      );
    }

    this.children = entity.children.map((c) => {
      const productDto: ProductResponseDto = {
        id: c.product.id,
        code: c.product.code,
        name: c.product.name,
        categoryId: c.product.categoryId,
        categoryName: c.product.categoryName,
        baseUnit: c.product.baseUnit,
        basePrice: c.product.basePrice.toFixed(3),
        costPrice: c.product.costPrice?.toFixed(3),
        reorderThreshold: c.product.reorderThreshold.toFixed(3),
        description: c.product.description ?? undefined,
        specText: c.product.specText ?? undefined,
        length: c.product.length?.toFixed(3) ?? null,
        width: c.product.width?.toFixed(3) ?? null,
        height: c.product.height?.toFixed(3) ?? null,
        parentProductId: c.product.parentProductId,
        createdAt: c.product.createdAt,
        updatedAt: c.product.updatedAt,
      };
      return new ProductLineageEntryDto(
        productDto,
        c.splitTicket ? new SplitTicketResponseDto(c.splitTicket) : undefined,
      );
    });
  }
}
