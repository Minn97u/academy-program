import { ApiPropertyOptional } from '@nestjs/swagger';
import { ExamType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Matches } from 'class-validator';

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
  @Matches(/^\d{4}-\d{2}$/)
  month?: string;
}
