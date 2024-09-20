import { Controller, Post, UseGuards, Get, Body, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorator/customize.decorator';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { log } from 'console';
import { Request, Response } from 'express';
import { IUser } from 'src/users/user.interface';


@Controller("auth") //  route /
export class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    @Public() //No need use JWT
    @ResponseMessage("User Login")
    @UseGuards(LocalAuthGuard)
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
    @Get("/account")
    @ResponseMessage("Get User Information ")
    handleGetAccount(@User() user: IUser) {
        return { user }
    }


    @Public()
    @Get("/refresh")
    @ResponseMessage("Get User refresh Token")
    handleRefreshToken(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response
    ) {
        const refreshToken = request.cookies["refresh_token"] //refresh_token = when response.cookie
        return this.authService.processNewToken(refreshToken, response)
    }


    @Post("/logout")
    @ResponseMessage("Logout !")
    handleLogout(
        @User() user: IUser,
        @Res({ passthrough: true }) response: Response) {
        return this.authService.logout(response, user)
    }
}
