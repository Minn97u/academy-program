import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateExamDto } from './dto/create-exam.dto';
import { ListExamsDto } from './dto/list-exams.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { UpsertResultDto } from './dto/upsert-result.dto';
import { ExamsService } from './exams.service';

@ApiTags('exams')
@Controller('exams')
export class ExamsController {
  constructor(private readonly exams: ExamsService) {}

  @Get()
  @ApiOperation({ summary: '시험 목록 (유형·반·월 필터)' })
  findAll(@Query() query: ListExamsDto) {
    return this.exams.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '시험 상세 (응시 대상 학생과 결과 포함)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.exams.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '시험 등록' })
  create(@Body() dto: CreateExamDto) {
    return this.exams.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '시험 수정' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExamDto) {
    return this.exams.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '시험 삭제 (결과도 함께 삭제)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.exams.remove(id);
  }

  @Put(':id/results/:studentId')
  @ApiOperation({ summary: '학생 결과 입력/수정 (점수·오답 문항·미응시)' })
  upsertResult(
    @Param('id', ParseIntPipe) id: number,
    @Param('studentId', ParseIntPipe) studentId: number,
    @Body() dto: UpsertResultDto,
  ) {
    return this.exams.upsertResult(id, studentId, dto);
  }

  @Delete(':id/results/:studentId')
  @ApiOperation({ summary: '학생 결과 삭제 (미입력 상태로 되돌림)' })
  removeResult(@Param('id', ParseIntPipe) id: number, @Param('studentId', ParseIntPipe) studentId: number) {
    return this.exams.removeResult(id, studentId);
  }
}
