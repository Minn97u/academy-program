import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

const classInclude = {
  teacher: { select: { id: true, name: true } },
  _count: { select: { students: true, exams: true } },
} as const;

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const rows = await this.prisma.classRoom.findMany({
      include: classInclude,
      orderBy: { id: 'asc' },
    });
    return rows.map((c) => this.toResponse(c));
  }

  async findOne(id: number) {
    const c = await this.prisma.classRoom.findUnique({ where: { id }, include: classInclude });
    if (!c) throw new NotFoundException('정규반을 찾을 수 없습니다.');
    return this.toResponse(c);
  }

  async create(dto: CreateClassDto) {
    await this.assertTeacher(dto.teacherId);
    if (!dto.days.length) throw new BadRequestException('수업 요일을 하나 이상 선택하세요.');
    const c = await this.prisma.classRoom.create({
      data: { ...dto, days: [...dto.days].sort(), description: dto.description ?? '' },
      include: classInclude,
    });
    return this.toResponse(c);
  }

  async update(id: number, dto: UpdateClassDto) {
    await this.findOne(id);
    if (dto.teacherId !== undefined) await this.assertTeacher(dto.teacherId);
    if (dto.days && !dto.days.length) throw new BadRequestException('수업 요일을 하나 이상 선택하세요.');
    const c = await this.prisma.classRoom.update({
      where: { id },
      data: { ...dto, days: dto.days ? [...dto.days].sort() : undefined },
      include: classInclude,
    });
    return this.toResponse(c);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.classRoom.delete({ where: { id } });
    return { deleted: true };
  }

  private async assertTeacher(teacherId: number) {
    const t = await this.prisma.teacher.findUnique({ where: { id: teacherId } });
    if (!t) throw new BadRequestException('담당 선생님을 찾을 수 없습니다.');
  }

  private toResponse(c: {
    id: number;
    name: string;
    grade: string;
    teacherId: number;
    teacher: { id: number; name: string };
    days: number[];
    startTime: string;
    endTime: string;
    description: string;
    createdAt: Date;
    _count: { students: number; exams: number };
  }) {
    const { _count, createdAt, ...rest } = c;
    return {
      ...rest,
      createdAt: createdAt.toISOString(),
      studentCount: _count.students,
      examCount: _count.exams,
    };
  }
}
