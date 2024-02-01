import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Get,
  UseGuards,
  Param,
  Patch,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { User } from 'src/users/users.entity';
import { CredentialsDto } from './dtos/credentials.dto';
import { GetUser } from './get-user.decorator';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/users/users.repository';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { UserRole } from 'src/users/users-roles.enum';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  @Post('/signup')
  async signUp(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ): Promise<{ message: string }> {
    await this.authService.signUp(createUserDto);
    return {
      message: 'Cadastro realizado com sucesso',
    };
  }

  @Post('/signin')
  async signIn(
    @Body(ValidationPipe) credentiaslsDto: CredentialsDto,
  ): Promise<{ token: string }> {
    return await this.authService.signIn(credentiaslsDto);
  }

  @Patch(':token')
  async confirmEmail(@Param('token') token: string) {
    await this.authService.confirmEmail(token);
    return {
      message: 'Email confirmado',
    };
  }

  @Post('/send-recover-email')
  async sendRecoverPasswordEmail(
    @Body('email') email: string,
  ): Promise<{ message: string }> {
    await this.authService.sendRecoverPasswordEmail(email);
    return {
      message: 'Foi enviado um email com instruções para resetar sua senha',
    };
  }

  @Patch('/reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.resetPassword(token, changePasswordDto);

    return {
      message: 'Senha alterada com sucesso',
    };
  }

  @Patch(':id/change-password')
  @UseGuards(AuthGuard())
  async changePassword(
    @Param('id') id: string,
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto,
    @GetUser() user: User,
  ) {
    if (user.role !== UserRole.ADMIN && user.id.toString() !== id)
      throw new UnauthorizedException(
        'Você não tem permissão para realizar esta operação',
      );

    await this.authService.changePassword(id, changePasswordDto);
    return {
      message: 'Senha alterada',
    };
  }

  @Get('/me')
  @UseGuards(AuthGuard())
  getMe(@GetUser() user: User): User {
    return user;
  }
}
