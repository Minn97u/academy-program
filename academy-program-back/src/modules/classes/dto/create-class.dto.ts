import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateClassDto {
  @ApiProperty({ example: '중2 심화 C반' })
  @IsString()
  @IsNotEmpty({ message: '반 이름을 입력하세요.' })
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: '중2' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  grade: string;

  @ApiProperty()
  @IsInt()
  teacherId: number;

  @ApiProperty({ description: '수업 요일 (0=일 … 6=토)', example: [1, 3, 5] })
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  days: number[];

  @ApiProperty({ example: '17:00' })
  @Matches(TIME, { message: '시작 시간은 HH:mm 형식으로 입력하세요.' })
  startTime: string;

  @ApiProperty({ example: '18:30' })
  @Matches(TIME, { message: '종료 시간은 HH:mm 형식으로 입력하세요.' })
  endTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}
