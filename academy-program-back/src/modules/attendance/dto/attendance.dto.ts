import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsDateOnly, IsMonthOnly } from '../../../common/validators/date';

export class ListAttendanceDto {
  @ApiProperty({ example: '2026-11-10' })
  @IsDateOnly()
  date: string;

  @ApiPropertyOptional({ description: '없으면 그 날 수업이 있는 모든 반' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  classId?: number;
}

export class CalendarAttendanceDto {
  @ApiProperty({ example: '2026-11' })
  @IsMonthOnly()
  month: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  classId?: number;
}

export class UpsertAttendanceDto {
  @ApiProperty()
  @IsInt()
  classId: number;

  @ApiProperty()
  @IsInt()
  studentId: number;

  @ApiProperty({ example: '2026-11-10' })
  @IsDateOnly()
  date: string;

  @ApiProperty({ enum: AttendanceStatus })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  memo?: string;
}
