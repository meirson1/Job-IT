import { NestFactory } from '@nestjs/core';
import { UploadModule } from './upload.module';

async function bootstrap() {
  const app = await NestFactory.create(UploadModule);

  const port = Number(process.env.FILE_SERVICE_PORT) || 3002;
  await app.listen(port, '0.0.0.0');

  console.log(`File Service is running on: http://localhost:${port}`);
}
void bootstrap();
