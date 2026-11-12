import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const setting = await this.prisma.setting.findUnique({
      where: { id: 1 },
      include: { teacher: true },
    });
    if (!setting) throw new NotFoundException('설정이 없습니다. 시드를 먼저 실행하세요.');
    return {
      academyName: setting.academyName,
      teacher: { id: setting.teacher.id, name: setting.teacher.name },
    };
  }

  async update(dto: UpdateSettingsDto) {
    const setting = await this.prisma.setting.findUnique({ where: { id: 1 } });
    if (!setting) throw new NotFoundException('설정이 없습니다.');
    await this.prisma.$transaction([
      this.prisma.setting.update({
        where: { id: 1 },
        data: dto.academyName === undefined ? {} : { academyName: dto.academyName },
      }),
      this.prisma.teacher.update({
        where: { id: setting.teacherId },
        data: dto.teacherName === undefined ? {} : { name: dto.teacherName },
      }),
    ]);
    return this.get();
  }
}
