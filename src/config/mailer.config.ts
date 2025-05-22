import {ConfigService} from "@nestjs/config";
import {GoogleRecaptchaModuleOptions} from "@nestlab/google-recaptcha";
import {isDev} from "../libs/common/utils/is-dev.util";
import {MailerOptions} from "@nestjs-modules/mailer";

export const getMailerConfig = async (
    configService: ConfigService
): Promise<MailerOptions> => ({
    transport: {
        host: configService.getOrThrow<string>('MAIL_HOST'),
        port: configService.getOrThrow<number>('MAIL_PORT'),
        secure: configService.getOrThrow<boolean>('SESSION_SECURE'), // Лучше напрямую
        auth: {
            user: configService.getOrThrow<string>('MAIL_LOGIN'),
            pass: configService.getOrThrow<string>('MAIL_PASSWORD'),
        },
    },
    defaults: {
        from: `"Elias Team" <${configService.getOrThrow<string>('MAIL_LOGIN')}>`,
    },
})
