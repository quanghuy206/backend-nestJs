import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { genSaltSync, hashSync } from 'bcryptjs';
import { log } from 'console';
import { Response } from 'express';
import ms from 'ms';
import { use } from 'passport';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { RoleService } from 'src/role/role.service';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { IUser } from 'src/users/user.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private rolesService: RoleService

    ) { }

    //ussername/ pass là 2 tham số thư viện passport nó ném về
    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByUsername(username);
        if (user) {
            const isValid = this.usersService.isValidPassword(pass, user.password);
            if (isValid === true) {
                const userRole = user.role as unknown as { _id: string, name: string }
                const temp = await this.rolesService.findOne(userRole._id)

                const objUser = {
                    ...user.toObject(),
                    permissions: temp?.permissions ?? []
                }
                return objUser;
            }
        }

        return null;
    }
    async login(iUser: IUser, response: Response) {
        const { _id, name, email, role, permissions } = iUser;
        const payload = {
            sub: "token login",
            iss: "from server",
            _id,
            name,
            email,
            role
        };
        const refresh_token = this.createRefreshToken(payload)

        //update user with refresh token from user_service before return client

        await this.usersService.updateUserToken(refresh_token, _id)

        //set refresh token as cookies
        response.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            maxAge: ms(this.configService.get<string>("JWT_REFRESH_EXPIRE")) * 1000,
        })

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                _id,
                name,
                email,
                role,
                permissions
            }

        }
    }

    logout = async (response: Response, user: IUser) => {
        await this.usersService.updateUserToken("", user._id)
        response.clearCookie("refresh_token")
        return "ok"
    }
    async register(user: RegisterUserDto) {
        let newUser = await this.usersService.register(user)
        return {
            _id: newUser?.id,
            createdAt: newUser?.createdAt
        }

    }

    createRefreshToken = (payload: any) => {
        const refresh_token = this.jwtService.sign(payload, {
            secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
            expiresIn: ms(this.configService.get<string>("JWT_REFRESH_EXPIRE")) / 1000
        })
        return refresh_token

    }

    // Get New Token
    processNewToken = async (refreshToken: string, response: Response) => {
        try {
            this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET")
            }) //check token expire or valid ?
            let user = await this.usersService.findUserByToken(refreshToken)
            if (user) {
                //update refresh Token
                const { _id, name, email, role } = user;
                const payload = {
                    sub: "token refresh",
                    iss: "from server",
                    _id,
                    name,
                    email,
                    role
                };
                const refresh_token = this.createRefreshToken(payload)

                //update user with refresh token from user_service

                await this.usersService.updateUserToken(refresh_token, _id.toString())

                const userRole = user.role as unknown as { _id: string, name: string }
                const temp = await this.rolesService.findOne(userRole._id)

                //set refresh token as cookies
                response.clearCookie("refresh_token")

                response.cookie('refresh_token', refresh_token, {
                    httpOnly: true,
                    maxAge: ms(this.configService.get<string>("JWT_REFRESH_EXPIRE")) * 1000,
                })

                return {
                    access_token: this.jwtService.sign(payload),
                    user: {
                        _id,
                        name,
                        email,
                        role,
                        permissions: temp.permissions
                    }

                }
            }
            else {
                throw new BadRequestException("Refresh Token không hợp lệ . Vui lòng login")
            }
        } catch (error) {
            throw new BadRequestException("Refresh Token không hợp lệ . Vui lòng login")
        }
    }
}
