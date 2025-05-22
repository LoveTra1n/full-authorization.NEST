import {Heading, Link, Body, Html, Text, Tailwind} from "@react-email/components";
import * as React from "react";
interface ConfirmationTemplateProps{
    domain:string,
    token:string,
}

export function ConfirmationTemplate({
    domain,token
}:ConfirmationTemplateProps){
    const confirmlink = `${domain}/auth/new-verification?token=${token}`

    return (
        <Tailwind>
            <Html>
                <Body >
                    <Heading>Подверждение почты</Heading>
                    <Text>
                        Что бы подтвердить свой адрес электронной почты пожалуйста,
                        перейдите по следующей ссылке

                    </Text>
                    <Link href={confirmlink}>verify address</Link>
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

