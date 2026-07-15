import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateProfileDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id }, include: { profile: true } });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email }, include: { profile: true } });
  }

  createUser(data: { email: string; passwordHash?: string }) {
    return this.prisma.user.create({ data });
  }

  async upsertProfile(userId: string, dto: UpdateProfileDto) {
    const existing = await this.prisma.profile.findUnique({ where: { userId } });

    if (!existing) {
      // Creating for the first time — all core fields are required
      const required = ['name', 'age', 'gender', 'heightCm', 'weightKg', 'activityLevel', 'fitnessGoal'] as const;
      const missing = required.filter((f) => dto[f] === undefined || dto[f] === null);
      if (missing.length > 0) {
        throw new BadRequestException(`Missing required profile fields: ${missing.join(', ')}`);
      }
      return this.prisma.profile.create({
        data: {
          userId,
          name: dto.name!,
          age: dto.age!,
          gender: dto.gender!,
          heightCm: dto.heightCm!,
          weightKg: dto.weightKg!,
          activityLevel: dto.activityLevel!,
          fitnessGoal: dto.fitnessGoal!,
          targetWeightKg: dto.targetWeightKg,
        },
      });
    }

    // Updating — only apply provided fields
    return this.prisma.profile.update({
      where: { userId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.age !== undefined && { age: dto.age }),
        ...(dto.gender !== undefined && { gender: dto.gender }),
        ...(dto.heightCm !== undefined && { heightCm: dto.heightCm }),
        ...(dto.weightKg !== undefined && { weightKg: dto.weightKg }),
        ...(dto.activityLevel !== undefined && { activityLevel: dto.activityLevel }),
        ...(dto.fitnessGoal !== undefined && { fitnessGoal: dto.fitnessGoal }),
        ...(dto.targetWeightKg !== undefined && { targetWeightKg: dto.targetWeightKg }),
      },
    });
  }
}
