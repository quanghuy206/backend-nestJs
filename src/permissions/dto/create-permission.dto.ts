import { IsNotEmpty } from "class-validator"

export class CreatePermissionDto {
    @IsNotEmpty({ message: "name Không được để trống" })
    name: string

    @IsNotEmpty({ message: "apiPath Không được để trống" })
    apiPath: string

    @IsNotEmpty({ message: "methob Không được để trống" })
    method: string

    @IsNotEmpty({ message: "module Không được để trống" })
    module: string
}
