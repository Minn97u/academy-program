import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsDateOnly } from '../../../common/validators/is-date-string';

export const NOTE_KINDS = ['상담', '학습', '학부모 연락'] as const;

export class CreateNoteDto {
  @ApiProperty({ enum: NOTE_KINDS })
  @IsIn(NOTE_KINDS)
  kind: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: '메모 내용을 입력하세요.' })
  @MaxLength(2000)
  text: string;

  @ApiPropertyOptional({ example: '2026-11-10', description: '없으면 오늘' })
  @IsOptional()
  @IsDateOnly()
  date?: string;
}
