import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../users/users.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'super-secret',
    });
  }

  async validate(payload: { id: string }) {
    const { id } = payload;
    console.log(id);
    // const user = await this.userRepository.findOne({ id });
    const user = await this.userRepository.findOne({
      where: { id: id },
      select: ['name', 'email', 'status', 'role', 'id'],
    });
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return user;
  }
}
