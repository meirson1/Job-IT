import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JobsController } from './jobs-service.controller';
import { JobsService } from './jobs-service.service';
import { PrismaModule } from '@app/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
  ],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsServiceModule {}
