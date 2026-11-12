import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AttendanceStatus, Prisma } from '@prisma/client';
import { toDate, toDateString } from '../../common/lib/date';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { ListStudentsDto } from './dto/list-students.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

const listInclude = {
  class: { select: { id: true, name: true, teacher: { select: { name: true } } } },
  results: { where: { status: 'DONE' as const }, select: { score: true, exam: { select: { date: true } } } },
  attendances: { select: { status: true } },
} satisfies Prisma.StudentInclude;

type StudentRow = Prisma.StudentGetPayload<{ include: typeof listInclude }>;

function avg(nums: number[]) {
  return nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : null;
}

export function attendanceSummary(rows: { status: AttendanceStatus }[]) {
  const count = (s: AttendanceStatus) => rows.filter((r) => r.status === s).length;
  const present = count('PRESENT');
  const late = count('LATE');
  const absent = count('ABSENT');
  const total = present + late + absent;
  return { present, late, absent, rate: total ? Math.round(((present + late) / total) * 100) : null };
}

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListStudentsDto) {
    const rows = await this.prisma.student.findMany({
      where: {
        name: query.q ? { contains: query.q } : undefined,
        grade: query.grade,
        classId: query.classId,
      },
      include: listInclude,
      orderBy: [{ classId: 'asc' }, { name: 'asc' }],
    });
    return rows.map((s) => this.toRow(s));
  }

  async findOne(id: number) {
    const s = await this.prisma.student.findUnique({
      where: { id },
      include: {
        ...listInclude,
        results: {
          include: { exam: { include: { results: { where: { status: 'DONE' }, select: { score: true } } } } },
          orderBy: { exam: { date: 'desc' } },
        },
        attendances: { orderBy: { date: 'desc' } },
        notes: { orderBy: [{ date: 'desc' }, { id: 'desc' }] },
      },
    });
    if (!s) throw new NotFoundException('학생을 찾을 수 없습니다.');
    const { results, attendances, notes, ...base } = s;
    return {
      ...this.toRow({ ...base, results: results.map((r) => ({ score: r.score, exam: { date: r.exam.date } })), attendances }),
      records: results.map((r) => ({
        examId: r.examId,
        name: r.exam.name,
        type: r.exam.type,
        date: toDateString(r.exam.date),
        total: r.exam.total,
        status: r.status,
        score: r.score,
        wrongNumbers: r.wrongNumbers,
        classAvg: avg(r.exam.results.map((x) => x.score).filter((x): x is number => x != null)),
      })),
      attendanceRecords: attendances.map((a) => ({ date: toDateString(a.date), status: a.status, memo: a.memo })),
      notes: notes.map((n) => ({ id: n.id, date: toDateString(n.date), kind: n.kind, text: n.text })),
    };
  }

  async create(dto: CreateStudentDto) {
    await this.assertClass(dto.classId);
    const s = await this.prisma.student.create({
      data: {
        name: dto.name,
        grade: dto.grade,
        classId: dto.classId ?? null,
        phone: dto.phone ?? '',
        memo: dto.memo ?? '',
        enrolledAt: dto.enrolledAt ? toDate(dto.enrolledAt) : undefined,
      },
      include: listInclude,
    });
    return this.toRow(s);
  }

  async update(id: number, dto: UpdateStudentDto) {
    await this.exists(id);
    await this.assertClass(dto.classId);
    const s = await this.prisma.student.update({
      where: { id },
      data: { ...dto, enrolledAt: dto.enrolledAt ? toDate(dto.enrolledAt) : undefined },
      include: listInclude,
    });
    return this.toRow(s);
  }

  async remove(id: number) {
    await this.exists(id);
    await this.prisma.student.delete({ where: { id } });
    return { deleted: true };
  }

  async addNote(studentId: number, dto: CreateNoteDto) {
    await this.exists(studentId);
    const n = await this.prisma.studentNote.create({
      data: { studentId, kind: dto.kind, text: dto.text, date: dto.date ? toDate(dto.date) : new Date() },
    });
    return { id: n.id, date: toDateString(n.date), kind: n.kind, text: n.text };
  }

  async removeNote(studentId: number, noteId: number) {
    const n = await this.prisma.studentNote.findFirst({ where: { id: noteId, studentId } });
    if (!n) throw new NotFoundException('메모를 찾을 수 없습니다.');
    await this.prisma.studentNote.delete({ where: { id: noteId } });
    return { deleted: true };
  }

  private async exists(id: number) {
    const s = await this.prisma.student.findUnique({ where: { id }, select: { id: true } });
    if (!s) throw new NotFoundException('학생을 찾을 수 없습니다.');
  }

  private async assertClass(classId: number | null | undefined) {
    if (classId == null) return;
    const c = await this.prisma.classRoom.findUnique({ where: { id: classId }, select: { id: true } });
    if (!c) throw new BadRequestException('소속 정규반을 찾을 수 없습니다.');
  }

  private toRow(s: StudentRow) {
    const sorted = [...s.results].sort((a, b) => a.exam.date.getTime() - b.exam.date.getTime());
    const scores = sorted.map((r) => r.score).filter((x): x is number => x != null);
    return {
      id: s.id,
      name: s.name,
      grade: s.grade,
      classId: s.classId,
      className: s.class?.name ?? null,
      teacherName: s.class?.teacher.name ?? null,
      phone: s.phone,
      memo: s.memo,
      enrolledAt: toDateString(s.enrolledAt),
      recentScore: scores.length ? scores[scores.length - 1] : null,
      avgScore: avg(scores),
      scores,
      attendance: attendanceSummary(s.attendances),
    };
  }
}
