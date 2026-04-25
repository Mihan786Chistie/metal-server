import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthJwtPayload } from '../types/jwtPayload';
import { Inject, Injectable } from '@nestjs/common';
import refreshJwtConfig from '../config/refresh-jwt.config';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class RefreshJWTStrategy extends PassportStrategy(
    Strategy,
    'refresh-jwt',
) {
    constructor(
        @Inject(refreshJwtConfig.KEY)
        private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: refreshJwtConfiguration.secret as string,
            ignoreExpiration: false,
            passReqToCallback: true,
        });
    }

    validate(req: Request, payload: AuthJwtPayload) {
        const refreshToken = (req.get('authorization') || '')
            .replace('Bearer', '')
            .trim();
        const userId = payload.sub;
        return this.authService.validateRefreshToken(userId, refreshToken);
    }
}