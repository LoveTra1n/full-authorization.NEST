import {UserRole} from "../../../prisma/__generated__";
import {ROLES_KEY} from "../decorators/roles.decorators";
import {CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException} from "@nestjs/common";
import {UserService} from "../../user/user.service";
import {Request} from "express";



@Injectable()
export class AuthGuard implements CanActivate {
    public constructor(private readonly userService: UserService) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {

        const request = context.switchToHttp().getRequest()

        if(typeof request.session.userId === "undefined") {
            throw new UnauthorizedException("Not authorized")
        }

        const user = await this.userService.findById(request.session.userId)
        request.user= user

        return true
    }
}