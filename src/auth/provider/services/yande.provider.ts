import {BaseOAuthService} from "./base-oauth.service";
import {TypeProviderOptions} from "./types/provider-options.type";
import {TypeUserInfo} from "./types/user-info.type";

export class YandexProvider extends BaseOAuthService{
    public constructor(options:TypeProviderOptions) {
        super({
            name:'yandex',
            authorize_url:'https://oauth.yandex.ru/authorize',
            access_url: 'https://oauth.yandex.ru/token',
            profile_url:'https://login.yandex.ru/info?format=json',
            scopes: options.scopes,
            client_id: options.client_id,
            client_secret: options.client_secret,
        });
    }

    public async extractUserInfo(data: YandexProfile): Promise<TypeUserInfo> {
        return super.extractUserInfo({
            email: typeof data.email === 'string' ? data.email : undefined,
            name: data.display_name ?? data.real_name ?? data.name ?? 'Yandex User',
            picture: data.default_avatar_id
                ? `https://avatars.yandex.net/get-yapic/${data.default_avatar_id}/islands-200`
                : undefined
        });
    }
}

interface YandexProfile extends Record<string, any>{
    aud:string
    azp:string
    email:string
    email_verified:boolean
    exp:number
    family_name?:string
    given_name:string
    hd?:string
    iat?:number
    iss:string
    jti?:string
    locale?:string
    name:string
    nbf?:string
    picture:string
    sub:string
    access_token:string
    refresh_token?:string

}