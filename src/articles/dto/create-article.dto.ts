import { IsNotEmpty } from "class-validator";

export class CreateArticleDto {
    @IsNotEmpty({ message: 'title không được để trống', })
    title: string;

    @IsNotEmpty({ message: 'content không được để trống', })
    content: string;

    @IsNotEmpty({ message: 'author không được để trống', })
    author: string;

    @IsNotEmpty({ message: 'logo không được để trống', })
    logo: string;

    @IsNotEmpty({ message: 'summary không được để trống', })
    summary: string;

}
