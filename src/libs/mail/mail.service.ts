import { Injectable } from '@nestjs/common';
import {MailerService} from "@nestjs-modules/mailer";
import {ConfigService} from "@nestjs/config";
import {render} from "@react-email/components";
import {ConfirmationTemplate} from "./template/confrimation.template";

@Injectable()
export class MailService {
    public constructor(private readonly mailerService:MailerService, private readonly configService: ConfigService) {
    }


    public async sendConfirmationEmail(email:string, token:string){

        const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
        const html = await  render(ConfirmationTemplate({domain, token}))


        return this.sendMail(email,'verify mail', html)
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
