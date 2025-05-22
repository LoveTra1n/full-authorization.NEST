import {Heading, Link, Body, Html, Text, Tailwind} from "@react-email/components";
import * as React from "react";
interface ResetPasswordTemplate{
    domain:string,
    token:string,
}

export function ResetPasswordTemplate({
                                         domain,token
                                     }:ResetPasswordTemplate){
    const resetLink = `${domain}/auth/new-password?token=${token}`

    return (
        <Tailwind>
            <Html>
                <Body >
                    <Heading>Подверждение почты</Heading>
                    <Text>
                        Вы запросили сброс пороля. Пожалуйста перейдите по следующей ссылке что бы создать новый

                    </Text>
                    <Link href={resetLink}>Подтвердить сброс пороля</Link>
                    <Text>
                        Эта ссылка действительна в течении 1 часа. если вы не запрашивали подверждение,
                        просто проигнорируйте это сообщение.
                    </Text>
                    <Text>Спасибо за использование сервиса!!</Text>
                </Body>
            </Html>
        </Tailwind>
    )
}

