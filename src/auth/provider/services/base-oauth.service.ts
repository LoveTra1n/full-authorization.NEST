import {
    BadRequestException,
    Injectable,
    UnauthorizedException
} from '@nestjs/common'

import { TypeBaseProviderOptions} from "./types/base-provider.options.types";
import { TypeUserInfo} from "./types/user-info.type";

@Injectable()
export class BaseOAuthService {
    private BASE_URL: string



    public constructor(private readonly options: TypeBaseProviderOptions) {}

    protected async extractUserInfo(data: any): Promise<TypeUserInfo> {
        return {
            ...data,
            provider: this.options.name
        }
    }

    public getAuthUrl() {
        const query = new URLSearchParams({
            response_type: 'code',
            client_id: this.options.client_id,
            redirect_uri: this.getRedirectUrl(),
            scope: (this.options.scopes ?? []).join(' '),
            access_type: 'offline',
            prompt: 'select_account'
        })

        console.log('Redirect URI:', this.getRedirectUrl());

        return `${this.options.authorize_url}?${query}`
    }

    public async findUserByCode(code: string): Promise<TypeUserInfo> {
        const client_id = this.options.client_id;
        const client_secret = this.options.client_secret;

        const tokenQuery = new URLSearchParams({
            client_id,
            client_secret,
            code,
            redirect_uri: this.getRedirectUrl(),
            grant_type: 'authorization_code'
        });

        const tokensRequest = await fetch(this.options.access_url, {
            method: 'POST',
            body: tokenQuery,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json'
            }
        });

        const tokens = await tokensRequest.json();
        console.log('[OAuth] tokens:', tokens);

        if (!tokensRequest.ok || !tokens.access_token) {
            throw new BadRequestException(
                `Ошибка при получении токена. Проверь redirect_uri, client_id и code.`
            );
        }

        const userRequest = await fetch(this.options.profile_url, {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`
            }
        });

        if (!userRequest.ok) {
            const errorText = await userRequest.text();
            console.error('[OAuth] Ошибка при запросе профиля:', errorText);
            throw new UnauthorizedException(
                `Ошибка при получении профиля: ${errorText}`
            );
        }

        const userText = await userRequest.text();
        console.log('[OAuth] user raw body:', userText);

        let user: any;
        try {
            user = JSON.parse(userText);
        } catch (err) {
            throw new Error('Невозможно распарсить профиль пользователя');
        }

        const userData = await this.extractUserInfo(user);

        return {
            ...userData,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: tokens.expires_at || tokens.expires_in,
            provider: this.options.name
        };
    }


    public getRedirectUrl() {
        return `${this.BASE_URL}/auth/oauth/callback/${this.options.name}`
    }

    set baseUrl(value: string) {
        this.BASE_URL = value
    }

    get name() {
        return this.options.name
    }

    get access_url() {
        return this.options.access_url
    }

    get profile_url() {
        return this.options.profile_url
    }

    get scopes() {
        return this.options.scopes
    }
}
