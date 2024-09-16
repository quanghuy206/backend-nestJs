import { Controller, Post, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/decorator/customize.decorator';
import { LocalAuthGuard } from './local-auth.guard';


@Controller("auth") //  route /
export class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    @Public() //No need use JWT
    @UseGuards(LocalAuthGuard)
    @Post('/login')
    handleLogin(@Request() req) {
        return this.authService.login(req.user);
    }

    // @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

}
