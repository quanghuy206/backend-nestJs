import { IsArray, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateSubscriberDto {
    @IsNotEmpty({ message: "name không được để trống" })
    name: string;

    @IsEmail({}, { message: "Email không đúng định dạng" })
    @IsNotEmpty({ message: "email không được để trống" })
    email: string;

    @IsArray({ message: "skills có định dạng là array" })
    @IsNotEmpty({ message: "skills Không được để trống" })
    @IsString({ each: true, message: "skill Phải là định dạng kiểu string" })
    skills: string[]
}
