import {IsNotEmpty, IsString} from "class-validator";

export class EmailConfirmationDto {
    @IsString({ message: 'token is required be string' })
    @IsNotEmpty({ message: 'token is required be empty' })
    token: string;
}