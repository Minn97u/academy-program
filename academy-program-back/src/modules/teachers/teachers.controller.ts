import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('teachers')
@Controller('teachers')
export class TeachersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: '선생님 목록' })
  findAll() {
    return this.prisma.teacher.findMany({
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });
  }
}
