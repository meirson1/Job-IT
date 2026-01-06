import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobsModule } from './job/jobs.module';
import { ApplicationModule } from './application/application.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    JobsModule,
    ApplicationModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
