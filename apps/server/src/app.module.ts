import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import * as Joi from 'joi';
import { AuthModule } from './auth/auth.module';
import { AssistantModule } from './assistant/assistant.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MealsModule } from './meals/meals.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_REFRESH_SECRET: Joi.string().min(32).required(),
        PORT: Joi.number().default(3000),
        CORS_ORIGIN: Joi.string().default(''),
        GOOGLE_CLIENT_ID: Joi.string().optional().allow(''),
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    PrismaModule,
    UsersModule,
    AuthModule,
    NutritionModule,
    MealsModule,
    DashboardModule,
    AssistantModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
