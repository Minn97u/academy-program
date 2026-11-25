import { ApiProperty } from '@nestjs/swagger';
import { ExamType } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsString, Max, MaxLength, Min } from 'class-validator';
import { IsDateOnly } from '../../../common/validators/date';

export class CreateExamDto {
  @ApiProperty({ example: '11월 3주차 정기 테스트' })
  @IsString()
  @IsNotEmpty({ message: '시험명을 입력하세요.' })
  @MaxLength(60)
  name: string;

  @ApiProperty({ enum: ExamType })
  @IsEnum(ExamType)
  type: ExamType;

  @ApiProperty()
  @IsInt()
  classId: number;

  @ApiProperty({ example: '2026-11-10' })
  @IsDateOnly()
  date: string;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(1, { message: '총점은 1 이상이어야 합니다.' })
  @Max(1000)
  total: number;

  @ApiProperty({ example: 20 })
  @IsInt()
  @Min(1, { message: '문항 수는 1 이상이어야 합니다.' })
  @Max(200)
  questionCount: number;
}
