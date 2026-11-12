import { Body, Controller, Delete, Get, Param, ParseIntPipe, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CalendarAttendanceDto, ListAttendanceDto, UpsertAttendanceDto } from './dto/attendance.dto';

@ApiTags('attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendance: AttendanceService) {}

  @Get()
  @ApiOperation({ summary: '날짜별 출석부' })
  findByDate(@Query() query: ListAttendanceDto) {
    return this.attendance.findByDate(query);
  }

  @Get('calendar')
  @ApiOperation({ summary: '월별 출석 체크 현황 (달력용)' })
  calendar(@Query() query: CalendarAttendanceDto) {
    return this.attendance.calendar(query);
  }

  @Put()
  @ApiOperation({ summary: '출석 상태 저장 (출석/지각/결석 + 비고)' })
  upsert(@Body() dto: UpsertAttendanceDto) {
    return this.attendance.upsert(dto);
  }

  @Delete(':studentId/:date')
  @ApiOperation({ summary: '출결 기록 삭제 (미체크로 되돌림)' })
  remove(@Param('studentId', ParseIntPipe) studentId: number, @Param('date') date: string) {
    return this.attendance.remove(studentId, date);
  }
}
