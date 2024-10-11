import { Controller, Post, UseGuards, Get, Body, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorator/customize.decorator';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterUserDto, UserLoginDto } from 'src/users/dto/create-user.dto';
import { Request, Response } from 'express';
import { IUser } from 'src/users/users.interface';
import { RoleService } from 'src/roles/role.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller("auth") //  route /
export class AuthController {
    constructor(
        private authService: AuthService,
        private roleService: RoleService

    ) { }

    @Public() //No need use JWT
    @ResponseMessage("User Login")
    @UseGuards(LocalAuthGuard)
    @ApiBody({ type: UserLoginDto, })
    @Post('/login')
    handleLogin(
        @Req() req,
        @Res({ passthrough: true }) response: Response
    ) {
        return this.authService.login(req.user, response);
    }

    // @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Req() req) {
        return req.user;
    }

    @Public()
    @ResponseMessage("Register a new user")
    @Post('register')
    handleRegister(@Body() registerUserDto: RegisterUserDto) {
        return this.authService.register(registerUserDto)
    }

    //Get User Infomation by refresh token
    @ResponseMessage("Get User Information ")
    @Get("/account")
    async handleGetAccount(@User() user: IUser) {
        const temp = await this.roleService.findOne(user.role._id) as any;
        user.permissions = temp.permissions
        return { user }
    }


    //call refresh token when accesstoken in cookie expire
    @ResponseMessage("Get User refresh Token")
    @Public()
    @Get("/refresh")
    handleRefreshToken(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response
    ) {
        const refreshToken = request.cookies["refresh_token"] //refresh_token = when response.cookie
        return this.authService.processNewToken(refreshToken, response)
    }


    @ResponseMessage("Logout !")
    @Post("/logout")
    handleLogout(
        @User() user: IUser,
        @Res({ passthrough: true }) response: Response) {
        return this.authService.logout(response, user)
    }
}
