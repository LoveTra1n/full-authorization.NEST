import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthMetod, User} from "../../prisma/__generated__";
import { verify } from 'argon2'
import { Request, Response } from 'express'

import { PrismaService} from "../prisma/prisma.service";
import { UserService} from "../user/user.service";

import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { ProviderService } from './provider/provider.service'


@Injectable()
export class AuthService {
    public constructor(
        private readonly prismaService: PrismaService,
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly providerService: ProviderService,

    ) {}

    public async register(dto: RegisterDto) {
        const isExists = await this.userService.findByEmail(dto.email)

        if (isExists) {
            throw new ConflictException(
                'Регистрация не удалась. Пользователь с таким email уже существует. Пожалуйста, используйте другой email или войдите в систему.'
            )
        }

        const newUser = await this.userService.create(
            dto.email,
            dto.password,
            dto.name,
            '',
            AuthMetod.CREDENTIALS,
            false
        )



        return {
            message:
                'Вы успешно зарегистрировались. Пожалуйста, подтвердите ваш email. Сообщение было отправлено на ваш почтовый адрес.'
        }
    }

    public async login(req: Request, dto: LoginDto) {
        const user = await this.userService.findByEmail(dto.email)

        if (!user || !user.password) {
            throw new NotFoundException(
                'Пользователь не найден. Пожалуйста, проверьте введенные данные'
            )
        }

        const isValidPassword = await verify(user.password, dto.password)

        if (!isValidPassword) {
            throw new UnauthorizedException(
                'Неверный пароль. Пожалуйста, попробуйте еще раз или восстановите пароль, если забыли его.'
            )
        }



        return this.saveSession(req, user)
    }

    public async extractProfileFromCode(
        req: Request,
        provider: string,
        code: string
    ) {
        const providerInstance = this.providerService.findByService(provider)
        const profile = await providerInstance?.findUserByCode(code)
        if (!profile) {
            throw new Error('No profile returned from provider')
        }

        const account = await this.prismaService.account.findFirst({
            where: {
                id: profile.id,
                provider: profile.provider
            }
        })

        let user = account?.userId
            ? await this.userService.findById(account.userId)
            : null

        if (user) {
            return this.saveSession(req, user)
        }

        user = await this.userService.create(
            profile.email,
            '',
            profile.name,
            profile.picture,
            AuthMetod[profile.provider.toUpperCase()],
            true
        )

        if (!account) {
            await this.prismaService.account.create({
                data: {
                    userId: user.id,
                    type: 'oauth',
                    provider: profile.provider,
                    accessToken: profile.access_token,
                    refreshToken: profile.refresh_token,
                    expiresAt: profile.expires_at
                }
            })
        }

        return this.saveSession(req, user)
    }

    public async logout(req: Request, res: Response): Promise<void> {
        return new Promise((resolve, reject) => {
            req.session.destroy(err => {
                if (err) {
                    return reject(
                        new InternalServerErrorException(
                            'Не удалось завершить сессию. Возможно, возникла проблема с сервером или сессия уже была завершена.'
                        )
                    )
                }
                res.clearCookie(
                    this.configService.getOrThrow<string>('SESSION_NAME')
                )
                resolve()
            })
        })
    }

    public async saveSession(req: Request, user: User) {
        return new Promise((resolve, reject) => {
            req.session.userId = user.id

            req.session.save(err => {
                if (err) {
                    return reject(
                        new InternalServerErrorException(
                            'Не удалось сохранить сессию. Проверьте, правильно ли настроены параметры сессии.'
                        )
                    )
                }

                resolve({
                    user
                })
            })
        })
    }
}



/*
import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException
} from '@nestjs/common';
import {$Enums, User} from "../../prisma/__generated__";
import {RegisterDto} from "./dto/register.dto";
import {UserService} from "../user/user.service";
import AuthMetod = $Enums.AuthMetod;
import {Request} from "express";
import {LoginDto} from "./dto/login.dto";
import {verify} from "argon2";
import {ConfigService} from "@nestjs/config";
import {Response} from "express";
import {ProviderService} from "./provider/provider.service";
import {PrismaService} from "../prisma/prisma.service";

@Injectable()
export class AuthService {
    public constructor(private readonly userService: UserService, private readonly configService: ConfigService, private readonly providerService: ProviderService, private readonly prismaService:PrismaService) {
    }
    public async register(req: Request,dto: RegisterDto) {
        const isExists = await this.userService.findByEmail(dto.email)

        if (isExists) {
            throw new ConflictException(
                'the email is already exists',
            )
        }
        if (!dto.email || !dto.password || !dto.name) {
            throw new Error('Missing required fields');
        }
        console.log('📥 DTO:', dto);

        const newUser = await this.userService.create(
            dto.email,
            dto.password,
            dto.name,
            '',
            AuthMetod.CREDENTIALS,
            false
        )

        console.log(newUser)
        return {newUser}
    }

    public async login(req:Request, dto:LoginDto) {
        const user = await this.userService.findByEmail(dto.email)

        if (!user || !user.password){
            throw new NotFoundException('USER could not be found')
        }

        const isValidPassword= await verify(user.password, dto.password)

        if(!isValidPassword){
            throw new UnauthorizedException(
                'password is incorrect',
            )
        }

        return this.saveSession(req,user)

    }
//     if (!providerInstance) {
//     throw new BadRequestException(`OAuth provider '${provider}' not found`);
// }

    public async extractProfileFromCode(
        req: Request,
        provider: string,
        code: string
    ) {
        const providerInstance = this.providerService.findByService(provider)

        if (!providerInstance) {
            throw new BadRequestException(`OAuth provider '${provider}' not found`);
        }
        const profile = await providerInstance.findUserByCode(code)

        const account = await this.prismaService.account.findFirst({
            where: {
                id: profile.id,
                provider: profile.provider
            }
        })

        let user = account?.userId
            ? await this.userService.findById(account.userId)
            : null

        if (user) {
            return this.saveSession(req, user)
        }

        user = await this.userService.create(
            profile.email,
            '',
            profile.name,
            profile.picture,
            AuthMetod[profile.provider.toUpperCase()],
            true
        )

        if (!account) {
            await this.prismaService.account.create({
                data: {
                    userId: user.id,
                    type: 'oauth',
                    provider: profile.provider,
                    accessToken: profile.access_token,
                    refreshToken: profile.refresh_token,
                    expiresAt: profile.expires_at
                }
            })
        }

        return this.saveSession(req, user)
    }

    public async logout(req:Request, res: Response):Promise<void> {
        return new Promise((resolve, reject) => {
            req.session.destroy(err => {
                if (err){
                    return reject(
                        new UnauthorizedException('failed to finished session'))
                }
                res.clearCookie(
                    this.configService.getOrThrow<string>('SESSION_NAME')
                );
                resolve()
            })
        })
    }

    private async saveSession(req:Request, user:User){
        return new Promise((resolve, reject)=>{
            req.session.userId = user.id

            req.session.save(err=>{
                if(err){
                    return reject(
                        new InternalServerErrorException(
                            'Failed to save the session'
                        )
                    );
                }
                resolve({
                    user
                })

            })
        })
    }
}
*/
