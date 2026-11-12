import { Controller, Get, Module } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
class HealthController {
  @Get()
  check() {
    return { ok: true };
  }
}

@Module({ controllers: [HealthController] })
export class HealthModule {}
