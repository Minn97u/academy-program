import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { toDate, toDateString } from '../../common/lib/date';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { ListExamsDto } from './dto/list-exams.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { UpsertResultDto } from './dto/upsert-result.dto';

const examInclude = {
  class: { select: { id: true, name: true, _count: { select: { students: true } } } },
  results: { select: { status: true, score: true } },
} satisfies Prisma.ExamInclude;

type ExamRow = Prisma.ExamGetPayload<{ include: typeof examInclude }>;

function avg(nums: number[]) {
  return nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : null;
}

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListExamsDto) {
    const rows = await this.prisma.exam.findMany({
      where: {
        type: query.type,
        classId: query.classId,
        date: query.month ? { gte: toDate(`${query.month}-01`), lt: nextMonth(query.month) } : undefined,
      },
      include: examInclude,
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    });
    return rows.map((e) => this.toRow(e));
  }

  async findOne(id: number) {
    const e = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        ...examInclude,
        class: {
          select: {
            id: true,
            name: true,
            _count: { select: { students: true } },
            students: { orderBy: { name: 'asc' } },
          },
        },
        results: true,
      },
    });
    if (!e) throw new NotFoundException('시험을 찾을 수 없습니다.');
    const byStudent = new Map(e.results.map((r) => [r.studentId, r]));
    return {
      ...this.toRow(e),
      students: e.class.students.map((s) => {
        const r = byStudent.get(s.id);
        return {
          id: s.id,
          name: s.name,
          result: r
            ? { status: r.status, score: r.score, wrongNumbers: r.wrongNumbers, updatedAt: r.updatedAt.toISOString() }
            : null,
        };
      }),
    };
  }

  async create(dto: CreateExamDto) {
    await this.assertClass(dto.classId);
    // 쓰기에 include를 붙이지 않고 다시 읽는다 (students.service 참고).
    const { id } = await this.prisma.exam.create({
      data: { ...dto, date: toDate(dto.date) },
      select: { id: true },
    });
    return this.row(id);
  }

  async update(id: number, dto: UpdateExamDto) {
    await this.exists(id);
    if (dto.classId !== undefined) await this.assertClass(dto.classId);
    await this.prisma.exam.update({
      where: { id },
      data: { ...dto, date: dto.date ? toDate(dto.date) : undefined },
      select: { id: true },
    });
    return this.row(id);
  }

  private async row(id: number) {
    const e = await this.prisma.exam.findUniqueOrThrow({ where: { id }, include: examInclude });
    return this.toRow(e);
  }

  async remove(id: number) {
    await this.exists(id);
    await this.prisma.exam.delete({ where: { id } });
    return { deleted: true };
  }

  async upsertResult(examId: number, studentId: number, dto: UpsertResultDto) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      select: { total: true, questionCount: true, classId: true },
    });
    if (!exam) throw new NotFoundException('시험을 찾을 수 없습니다.');
    const student = await this.prisma.student.findUnique({ where: { id: studentId }, select: { classId: true } });
    if (!student || student.classId !== exam.classId)
      throw new BadRequestException('이 시험의 응시 대상 학생이 아닙니다.');

    const absent = dto.status === 'ABSENT';
    const score = absent ? null : dto.score;
    const wrongNumbers = absent ? [] : (dto.wrongNumbers ?? []);
    if (!absent && score == null) throw new BadRequestException('점수를 입력하세요.');
    if (score != null && score > exam.total)
      throw new BadRequestException(`점수는 총점 ${exam.total}점을 넘을 수 없습니다.`);
    if (wrongNumbers.some((n) => n > exam.questionCount))
      throw new BadRequestException(`문항 번호는 1~${exam.questionCount} 사이여야 합니다.`);

    const r = await this.prisma.examResult.upsert({
      where: { examId_studentId: { examId, studentId } },
      create: { examId, studentId, status: dto.status, score, wrongNumbers: [...wrongNumbers].sort((a, b) => a - b) },
      update: { status: dto.status, score, wrongNumbers: [...wrongNumbers].sort((a, b) => a - b) },
    });
    return { status: r.status, score: r.score, wrongNumbers: r.wrongNumbers, updatedAt: r.updatedAt.toISOString() };
  }

  async removeResult(examId: number, studentId: number) {
    const r = await this.prisma.examResult.findUnique({ where: { examId_studentId: { examId, studentId } } });
    if (!r) throw new NotFoundException('입력된 결과가 없습니다.');
    await this.prisma.examResult.delete({ where: { id: r.id } });
    return { deleted: true };
  }

  private async exists(id: number) {
    const e = await this.prisma.exam.findUnique({ where: { id }, select: { id: true } });
    if (!e) throw new NotFoundException('시험을 찾을 수 없습니다.');
  }

  private async assertClass(classId: number) {
    const c = await this.prisma.classRoom.findUnique({ where: { id: classId }, select: { id: true } });
    if (!c) throw new BadRequestException('대상 정규반을 찾을 수 없습니다.');
  }

  private toRow(e: ExamRow) {
    const scores = e.results.filter((r) => r.status === 'DONE' && r.score != null).map((r) => r.score as number);
    return {
      id: e.id,
      name: e.name,
      type: e.type,
      classId: e.classId,
      className: e.class.name,
      date: toDateString(e.date),
      total: e.total,
      questionCount: e.questionCount,
      createdAt: e.createdAt.toISOString(),
      participantCount: e.class._count.students,
      enteredCount: e.results.length,
      absentCount: e.results.filter((r) => r.status === 'ABSENT').length,
      avgScore: avg(scores),
      maxScore: scores.length ? Math.max(...scores) : null,
      minScore: scores.length ? Math.min(...scores) : null,
    };
  }
}

function nextMonth(month: string) {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m, 1));
}
