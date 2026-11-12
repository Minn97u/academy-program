import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { ClassesModule } from './modules/classes/classes.module';
import { ExamsModule } from './modules/exams/exams.module';
import { HealthModule } from './modules/health/health.module';
import { SettingsModule } from './modules/settings/settings.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    PrismaModule,
    HealthModule,
    SettingsModule,
    TeachersModule,
    ClassesModule,
    StudentsModule,
    ExamsModule,
    AttendanceModule,
  ],
})
export class AppModule {}
