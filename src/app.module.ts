import { FileService } from './file/file.service';
import { UploadModule } from './upload/upload.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { typeOrmConfig } from './configs/typeorm.config';
import { UserRepository } from './users/users.repository';
import { AuthModule } from './auth/auth.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './configs/winston.config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerInterceptor } from './interceptors/logger.interceptor';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerConfig } from './configs/mailer.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    WinstonModule.forRoot(winstonConfig),
    MailerModule.forRoot(mailerConfig),
    UploadModule,
    UsersModule.forCustomRepository([UserRepository]),
    AuthModule,
  ],
  controllers: [],
  providers: [
    FileService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
  ],
})
export class AppModule {}
