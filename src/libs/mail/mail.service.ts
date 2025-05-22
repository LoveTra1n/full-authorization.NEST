import { Injectable } from '@nestjs/common';
import {MailerService} from "@nestjs-modules/mailer";
import {ConfigService} from "@nestjs/config";
import {render} from "@react-email/components";
import {ConfirmationTemplate} from "./template/confrimation.template";
import {ResetPasswordTemplate} from "./template/reset-password.template";
import {TwoFactorAuthTemplate} from "./template/two-factor.template";

@Injectable()
export class MailService {
    public constructor(private readonly mailerService:MailerService, private readonly configService: ConfigService) {
    }


    public async sendConfirmationEmail(email:string, token:string){

        const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
        const html = await  render(ConfirmationTemplate({domain, token}))


        return this.sendMail(email,'verify mail', html)
    }

    public async sendPasswordResetEmail(email:string, token:string){
        const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
        const html = await  render(ResetPasswordTemplate({domain, token}))

        return this.sendMail(email,'reset password', html)

    }

    public async sendTwoFactorTokenEmail(email:string, token:string){
        const html = await  render(TwoFactorAuthTemplate({token}))

        return this.sendMail(email,'Подтверждения личности', html)

    }



    private sendMail(email:string,subject:string,html:string){


        return this.mailerService.sendMail({
            from: `Elias Team <elmhurst@eliasname.us>`,
            to:email,
            subject,
            html
        })
    }
}
