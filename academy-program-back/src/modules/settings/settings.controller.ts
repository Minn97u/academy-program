import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  @ApiOperation({ summary: '학원·선생님 설정 조회' })
  get() {
    return this.settings.get();
  }

  @Patch()
  @ApiOperation({ summary: '학원·선생님 설정 수정' })
  update(@Body() dto: UpdateSettingsDto) {
    return this.settings.update(dto);
  }
}
