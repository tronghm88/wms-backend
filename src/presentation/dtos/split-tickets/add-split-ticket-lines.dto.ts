import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

export class AddSplitTicketLineDto {
  @ApiProperty({ example: 1, description: "Target product ID" })
  @IsNumber()
  @IsNotEmpty()
  targetProductId: number;

  @ApiProperty({ example: 10.5, description: "Quantity of the child line" })
  @IsNumber()
  @IsNotEmpty()
  @Min(0.001)
  quantity: number;

  @ApiProperty({ example: "m2", description: "Unit code for the child line" })
  @IsString()
  @IsNotEmpty()
  unitCode: string;

  @ApiProperty({
    example: false,
    description: "Whether this is a newly created product from split",
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isNewProduct?: boolean = false;

  @ApiProperty({
    example: "Line note",
    description: "Optional note for the line item",
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}

export class AddSplitTicketLinesDto {
  @ApiProperty({
    type: [AddSplitTicketLineDto],
    description: "List of child lines to add",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddSplitTicketLineDto)
  lines: AddSplitTicketLineDto[];
}
