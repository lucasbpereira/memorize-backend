import { DynamicModule, Module, Provider } from '@nestjs/common';
import { UserRepository } from './users.repository';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DataSource } from 'typeorm';
import { USERS_CUSTOM_REPOSITORY } from './users.decorator';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {
  public static forCustomRepository<T extends new (...args: any[]) => any>(
    repositories: T[],
  ): DynamicModule {
    const providers: Provider[] = [];

    for (const repository of repositories) {
      const entity = Reflect.getMetadata(USERS_CUSTOM_REPOSITORY, repository);

      if (!entity) {
        continue;
      }

      providers.push({
        inject: [getDataSourceToken()],
        provide: repository,
        useFactory: (dataSource: DataSource): typeof repository => {
          const baseRepository = dataSource.getRepository<any>(entity);
          return new repository(
            baseRepository.target,
            baseRepository.manager,
            baseRepository.queryRunner,
          );
        },
      });
    }

    return {
      exports: providers,
      module: UsersModule,
      providers,
    };
  }
}
