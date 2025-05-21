import {UserRole} from "@prisma/client";
import {applyDecorators, UseGuards} from "@nestjs/common";
import {AuthGuard} from "../guard/auth.guard";
import {RolesGuard} from "../guard/roles.guard";
import {Roles} from "./roles.decorators";

export function Authorization(...roles: UserRole[]) {
    if(roles.length === 0) {
        return applyDecorators(
            Roles(...roles),
            UseGuards( AuthGuard, RolesGuard)
        )
    }

    return applyDecorators(UseGuards(AuthGuard));
}