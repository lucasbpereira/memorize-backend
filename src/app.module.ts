import { UploadModule } from './upload/upload.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: 'localhost',
    //   port: 5432,
    //   password: 'LucasBP#258',
    //   username: 'postgres',
    //   entities: [],
    //   database: 'memorizedb',
    //   synchronize: true,
    //   logging: true,
    // }),
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
