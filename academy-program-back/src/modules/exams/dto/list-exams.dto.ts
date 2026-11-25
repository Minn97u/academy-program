import { ApiPropertyOptional } from '@nestjs/swagger';
import { ExamType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { IsMonthOnly } from '../../../common/validators/date';

export class ListExamsDto {
  @ApiPropertyOptional({ enum: ExamType })
  @IsOptional()
  @IsEnum(ExamType)
  type?: ExamType;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  classId?: number;

  @ApiPropertyOptional({ example: '2026-11', description: 'YYYY-MM' })
  @IsOptional()
  @IsMonthOnly()
  month?: string;
}
