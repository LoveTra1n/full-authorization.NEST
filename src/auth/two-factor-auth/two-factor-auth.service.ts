import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from "../../prisma/prisma.service";
import {v4 as uuidv4} from "uuid";
import {TokenType} from "../../../prisma/__generated__";
import e from "express";
import {MailService} from "../../libs/mail/mail.service";

@Injectable()
export class TwoFactorAuthService {
    public constructor(
        private readonly prismaService: PrismaService,
        private readonly mailService: MailService,
    ) {}

    public async validateTwoFactorToken(email:string,code:string){
        const existingToken = await this.prismaService.token.findFirst({
            where:{
               email,
                type:TokenType.TWO_FACTOR
            }
        })
        if (!existingToken) {
            throw new NotFoundException("Token two factor auth not found");
        }

        if(existingToken.token !== code){
            throw new BadRequestException('wrong token');
        }

        const hasExpired = new Date(existingToken.expiresIn)< new Date()
        if(hasExpired){
            throw new BadRequestException('token has been expired, please try again!');
        }


        await this.prismaService.token.delete({
            where:{
                id:existingToken.id,
                type:TokenType.TWO_FACTOR
            }
        })

        return true
    }

    public async sendTwoFactorToken(email:string){
        const twoFactorToken = await this.generateGenerateTwoFactorToken(email)

        await this.mailService.sendTwoFactorTokenEmail(
            twoFactorToken.email,
            twoFactorToken.token
        )

        return true

    }

    private async generateGenerateTwoFactorToken(email: string) {
        const token = Math.floor(
            Math.random() *(1000000-100000)+100000
        ).toString();

        const expiresIn = new Date(Date.now() + 300000)
        const existingToken = await this.prismaService.token.findFirst({
            where: {
                email,
                type: TokenType.TWO_FACTOR
            }
        })

        if (existingToken) {
            await this.prismaService.token.delete({
                where: {
                    id: existingToken.id,
                    type: TokenType.TWO_FACTOR
                }
            })
        }


        const twoFactorToken = await this.prismaService.token.create({
            data: {
                email,
                token,
                expiresIn,
                type: TokenType.TWO_FACTOR,

            }
        })

        return twoFactorToken
    }

}
