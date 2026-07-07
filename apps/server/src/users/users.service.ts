import { Injectable } from '@nestjs/common';
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
    return this.prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        name: dto.name ?? '',
        age: dto.age ?? 0,
        gender: dto.gender ?? 'OTHER',
        heightCm: dto.heightCm ?? 0,
        weightKg: dto.weightKg ?? 0,
        activityLevel: dto.activityLevel ?? 'SEDENTARY',
        fitnessGoal: dto.fitnessGoal ?? 'MAINTAIN',
        targetWeightKg: dto.targetWeightKg,
      },
      update: { ...dto },
    });
  }
}
