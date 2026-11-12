import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateNoteDto } from './dto/create-note.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { ListStudentsDto } from './dto/list-students.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsService } from './students.service';

@ApiTags('students')
@Controller('students')
export class StudentsController {
  constructor(private readonly students: StudentsService) {}

  @Get()
  @ApiOperation({ summary: '학생 목록 (이름·학년·반 필터)' })
  findAll(@Query() query: ListStudentsDto) {
    return this.students.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '학생 상세 (시험 기록·출결·메모 포함)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.students.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '학생 등록' })
  create(@Body() dto: CreateStudentDto) {
    return this.students.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '학생 수정' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStudentDto) {
    return this.students.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '학생 삭제' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.students.remove(id);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: '상담·학습 메모 추가' })
  addNote(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateNoteDto) {
    return this.students.addNote(id, dto);
  }

  @Delete(':id/notes/:noteId')
  @ApiOperation({ summary: '메모 삭제' })
  removeNote(
    @Param('id', ParseIntPipe) id: number,
    @Param('noteId', ParseIntPipe) noteId: number,
  ) {
    return this.students.removeNote(id, noteId);
  }
}
