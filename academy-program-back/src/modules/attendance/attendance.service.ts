import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { monthRange, toDate, toDateString } from '../../common/lib/date';
import { PrismaService } from '../../prisma/prisma.service';
import { CalendarAttendanceDto, ListAttendanceDto, UpsertAttendanceDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  /** 날짜별 출석부. 반을 고르지 않으면 그 요일에 수업이 있는 반만 보여준다. */
  async findByDate(query: ListAttendanceDto) {
    const date = toDate(query.date);
    const dow = date.getUTCDay();
    const classes = await this.prisma.classRoom.findMany({
      where: query.classId ? { id: query.classId } : { days: { has: dow } },
      include: {
        students: { where: { enrolledAt: { lte: date } }, orderBy: { name: 'asc' } },
        attendances: { where: { date } },
      },
      orderBy: { startTime: 'asc' },
    });
    return classes.map((c) => {
      const byStudent = new Map(c.attendances.map((a) => [a.studentId, a]));
      return {
        classId: c.id,
        className: c.name,
        startTime: c.startTime,
        endTime: c.endTime,
        meetsToday: c.days.includes(dow),
        students: c.students.map((s) => {
          const a = byStudent.get(s.id);
          return { id: s.id, name: s.name, status: a?.status ?? null, memo: a?.memo ?? '' };
        }),
      };
    });
  }

  /** 월별 달력용: 날짜마다 체크된 학생 수. */
  async calendar(query: CalendarAttendanceDto) {
    const rows = await this.prisma.attendance.groupBy({
      by: ['date'],
      where: { classId: query.classId, date: monthRange(query.month) },
      _count: { _all: true },
      orderBy: { date: 'asc' },
    });
    return rows.map((r) => ({ date: toDateString(r.date), count: r._count._all }));
  }

  async upsert(dto: UpsertAttendanceDto) {
    const student = await this.prisma.student.findUnique({ where: { id: dto.studentId }, select: { classId: true } });
    if (!student) throw new NotFoundException('학생을 찾을 수 없습니다.');
    if (student.classId !== dto.classId) throw new BadRequestException('이 반의 학생이 아닙니다.');
    const date = toDate(dto.date);
    const a = await this.prisma.attendance.upsert({
      where: { studentId_date: { studentId: dto.studentId, date } },
      create: { classId: dto.classId, studentId: dto.studentId, date, status: dto.status, memo: dto.memo ?? '' },
      update: { classId: dto.classId, status: dto.status, memo: dto.memo },
    });
    return { studentId: a.studentId, date: toDateString(a.date), status: a.status, memo: a.memo };
  }

  async remove(studentId: number, dateStr: string) {
    const date = toDate(dateStr);
    const a = await this.prisma.attendance.findUnique({ where: { studentId_date: { studentId, date } } });
    if (!a) throw new NotFoundException('출결 기록이 없습니다.');
    await this.prisma.attendance.delete({ where: { id: a.id } });
    return { deleted: true };
  }
}
