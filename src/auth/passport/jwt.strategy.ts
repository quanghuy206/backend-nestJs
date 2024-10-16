import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoleService } from 'src/roles/role.service';
import { IUser } from 'src/users/users.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private rolesService: RoleService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //need header Bearer Token
            ignoreExpiration: false,
            secretOrKey: configService.get<string>("JWT_ACCESS_TOKEN_SECRET") //
        });
        //decode token header
    }

    //done success return req.user
    async validate(payload: IUser) {
        const { _id, name, email, role } = payload;

        const userRole = role as unknown as { _id: string, name: string }
        const temp = (await this.rolesService.findOne(userRole._id)).toObject()
        //req.user
        return {
            _id,
            name,
            email,
            role,
            permissions: temp?.permissions ?? []
        };

    }
}