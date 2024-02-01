import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './../users/users.repository';
import { UsersService } from './users.service';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserRole } from './users-roles.enum';
import { FindUsersQueryDto } from './dtos/find-users-query.dto';

const mockUserRepository = () => ({
  createUser: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  findUsers: jest.fn(),
});

describe('UsersService', () => {
  let userRepository;
  let service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    userRepository = await module.get<UserRepository>(UserRepository);
    service = await module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  describe('createUser', () => {
    let mockCreateUserDto: CreateUserDto;

    beforeEach(() => {
      mockCreateUserDto = {
        email: 'mock@email.com',
        name: 'Mock User',
        password: 'mockPassword',
        passwordConfirmation: 'mockPassword',
      };
    });

    it('should create an user if passwords match', async () => {
      userRepository.createUser.mockResolvedValue('mockUser');
      const result = await service.createAdminUser(mockCreateUserDto);

      expect(userRepository.createUser).toHaveBeenCalledWith(
        mockCreateUserDto,
        UserRole.ADMIN,
      );
      expect(result).toEqual('mockUser');
    });

    it('should throw an error if passwords doesnt match', async () => {
      mockCreateUserDto.passwordConfirmation = 'wrongPassword';
      expect(service.createAdminUser(mockCreateUserDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('findUserById', () => {
    it('should return the found user', async () => {
      userRepository.findOne.mockResolvedValue('mockUser');
      expect(userRepository.findOne).not.toHaveBeenCalled();

      const result = await service.findUserById('mockId');
      const select = ['email', 'name', 'role', 'id'];

      // Utilize toMatchObject para comparar parcialmente os objetos
      expect(userRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'mockId' },
          select: expect.arrayContaining(select),
        }),
      );

      expect(result).toEqual('mockUser');
    });

    it('should throw an error as user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      expect(service.findUserById('mockId')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should return affected > 0 if user is deleted', async () => {
      userRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteUser('mockId');
      expect(userRepository.delete).toHaveBeenCalledWith({ id: 'mockId' });
    });

    it('should throw an error if no user is deleted', async () => {
      userRepository.delete.mockResolvedValue({ affected: 0 });

      expect(service.deleteUser('mockId')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findUsers', () => {
    it('should call the findUsers method of the userRepository', async () => {
      userRepository.findUsers.mockResolvedValue('resultOfsearch');
      const mockFindUsersQueryDto: FindUsersQueryDto = {
        name: '',
        email: '',
        limit: 1,
        page: 1,
        role: '',
        sort: '',
        status: true,
      };
      const result = await service.findUsers(mockFindUsersQueryDto);
      expect(userRepository.findUsers).toHaveBeenCalledWith(
        mockFindUsersQueryDto,
      );
      expect(result).toEqual('resultOfsearch');
    });
  });
});
