import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@ApiTags('classes')
@Controller('classes')
export class ClassesController {
  constructor(private readonly classes: ClassesService) {}

  @Get()
  @ApiOperation({ summary: '정규반 목록' })
  findAll() {
    return this.classes.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '정규반 상세' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.classes.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '정규반 생성' })
  create(@Body() dto: CreateClassDto) {
    return this.classes.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '정규반 수정' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClassDto) {
    return this.classes.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '정규반 삭제 (학생은 미배정으로 남고 시험·출결은 함께 삭제)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.classes.remove(id);
  }
}
