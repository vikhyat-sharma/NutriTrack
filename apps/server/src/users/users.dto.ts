import { IsString, IsInt, IsNumber, IsOptional, IsIn, Min } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  age?: number;

  @IsOptional()
  @IsIn(['MALE', 'FEMALE', 'OTHER'])
  gender?: string;

  @IsOptional()
  @IsNumber()
  heightCm?: number;

  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsIn(['SEDENTARY', 'LIGHT_MODERATE', 'ACTIVE', 'VERY_ACTIVE'])
  activityLevel?: string;

  @IsOptional()
  @IsIn(['LOSE', 'MAINTAIN', 'GAIN'])
  fitnessGoal?: string;

  @IsOptional()
  @IsNumber()
  targetWeightKg?: number;
}
