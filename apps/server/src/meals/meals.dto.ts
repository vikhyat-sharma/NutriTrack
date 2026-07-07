import { IsIn, IsDateString, IsArray, ValidateNested, IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class MealItemDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsString()
  servingSize?: string;

  @IsNumber()
  @Min(0)
  calories: number;

  @IsNumber()
  @Min(0)
  proteinG: number;

  @IsNumber()
  @Min(0)
  carbsG: number;

  @IsNumber()
  @Min(0)
  fatG: number;

  @IsNumber()
  @Min(0)
  fiberG: number;
}

export class CreateMealDto {
  @IsDateString()
  date: string;

  @IsIn(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'])
  type: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MealItemDto)
  items: MealItemDto[];
}

export class UpdateMealDto {
  @IsOptional()
  @IsIn(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'])
  type?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MealItemDto)
  items?: MealItemDto[];
}
