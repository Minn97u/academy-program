import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsDateOnly } from '../../../common/validators/date';

export class CreateStudentDto {
  @ApiProperty({ example: '김민수' })
  @IsString()
  @IsNotEmpty({ message: '학생 이름을 입력하세요.' })
  @MaxLength(30)
  name: string;

  @ApiProperty({ example: '중2' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  grade: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsInt()
  classId?: number | null;

  @ApiPropertyOptional({ example: '010-0000-0000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  memo?: string;

  @ApiPropertyOptional({ example: '2026-11-10', description: '등록일. 없으면 오늘' })
  @IsOptional()
  @IsDateOnly()
  enrolledAt?: string;
}
