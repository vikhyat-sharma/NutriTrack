import { IsIn, IsNumber, IsOptional, Min } from 'class-validator';

export class NutritionTargetsDto {
  @IsNumber()
  @Min(1)
  age: number;

  @IsIn(['MALE', 'FEMALE', 'OTHER'])
  gender: string;

  @IsNumber()
  @Min(50)
  heightCm: number;

  @IsNumber()
  @Min(1)
  weightKg: number;

  @IsIn(['SEDENTARY', 'LIGHT_MODERATE', 'ACTIVE', 'VERY_ACTIVE'])
  activityLevel: string;

  @IsIn(['LOSE', 'MAINTAIN', 'GAIN'])
  fitnessGoal: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  targetWeightKg?: number;
}
