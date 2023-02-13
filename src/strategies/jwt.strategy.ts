import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../types/jwtPayload';
import { UserService } from 'src/modules/user/user.service';
import { ConfigService } from '@nestjs/config';
import { clientFeedback } from 'src/utils/clientReturnfunction';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService, private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRETKEY'),
    });
  }

  async validate(payload: JwtPayload) {
    if(!payload.email) {
      return clientFeedback ({
        status: HttpStatus.BAD_REQUEST,
        message: "Email is required"
      });
    }
    const user = await this.userService.validateUser(payload);
    if (!user) {
      throw new UnauthorizedException(
        clientFeedback({
            status: 401,
            message: 'Unauthorized!'
          })
      );
    }
    return user;
  }
}