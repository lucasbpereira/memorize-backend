import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './users.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserRole } from './users-roles.enum';
import { User } from './users.entity';
import { UpdateUserDto } from './dtos/update-users.dto';
import { FindUsersQueryDto } from './dtos/find-users-query.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  async createAdminUser(createUserDto: CreateUserDto): Promise<User> {
    if (createUserDto.password != createUserDto.passwordConfirmation) {
      throw new UnprocessableEntityException('As senhas não conferem');
    } else {
      return this.userRepository.createUser(createUserDto, UserRole.ADMIN);
    }
  }

  async findUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['email', 'name', 'role', 'id'],
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    return user;
  }

  // async updateUser(updateUserDto: UpdateUserDto, id: string): Promise<User> {
  //   const user = await this.findUserById(id);
  //   const { name, email, role, status } = updateUserDto;
  //   user.name = name ? name : user.name;
  //   user.email = email ? email : user.email;
  //   user.role = role ? role : user.role;
  //   user.status = status === undefined ? user.status : status;
  //   try {
  //     await user.save();
  //     return user;
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       'Erro ao salvar os dados no banco de dados',
  //     );
  //   }
  // }

  async updateUser(updateUserDto: UpdateUserDto, id: string) {
    const result = await this.userRepository.update({ id }, updateUserDto);
    if (result.affected > 0) {
      const user = await this.findUserById(id);
      return user;
    } else {
      throw new NotFoundException('Usuário não encontrado');
    }
  }

  async deleteUser(userId: string) {
    const result = await this.userRepository.delete({ id: userId });
    if (result.affected === 0) {
      throw new NotFoundException(
        'Não foi encontrado um usuário com o ID informado',
      );
    }
  }

  async findUsers(
    queryDto: FindUsersQueryDto,
  ): Promise<{ users: User[]; total: number }> {
    const users = await this.userRepository.findUsers(queryDto);
    return users;
  }
}
