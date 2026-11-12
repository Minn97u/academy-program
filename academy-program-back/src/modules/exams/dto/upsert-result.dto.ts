import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResultStatus } from '@prisma/client';
import { ArrayUnique, IsArray, IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export class UpsertResultDto {
  @ApiProperty({ enum: ResultStatus })
  @IsEnum(ResultStatus)
  status: ResultStatus;

  @ApiPropertyOptional({ description: '미응시면 생략' })
  @IsOptional()
  @IsInt()
  @Min(0)
  score?: number;

  @ApiPropertyOptional({ type: [Number], description: '틀린 문항 번호' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  wrongNumbers?: number[];
}
