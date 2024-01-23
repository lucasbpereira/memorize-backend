import { Module } from '@nestjs/common';
import { UploadControllerController } from './upload.controller';

@Module({
  imports: [],
  controllers: [UploadControllerController],
  providers: [],
})
export class UploadModule {}
