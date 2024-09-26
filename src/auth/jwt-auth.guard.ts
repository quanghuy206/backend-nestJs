import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/decorator/customize.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

    constructor(private reflector: Reflector) {
        super();
    }
    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [ // Get info MetaData Must Param (key,true)
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        return super.canActivate(context); //Farmwork auto check JWT 
    }

    handleRequest(err, user, info, context: ExecutionContext) {
        // You can throw an exception based on either "info" or "err" arguments
        const request: Request = context.switchToHttp().getRequest();
        if (err || !user) {
            throw err || new UnauthorizedException("Token không hợp lệ or không có token ở Bearer token ở header");
        }

        //check permissions

        const targetMethod = request.method
        const targetEndPoint = request.route?.path as string

        const permissions = user?.permissions ?? [];
        let isExist = permissions.find(permissions =>
            targetMethod === permissions.method && targetEndPoint === permissions.apiPath
        )
        if (targetEndPoint.startsWith("/api/v1/auth")) isExist = true
        if (!isExist) {
            throw new ForbiddenException("Bạn không có quyền để truy cập endpoint này")
        }
        return user;
    }
}
