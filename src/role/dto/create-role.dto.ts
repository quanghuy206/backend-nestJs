import { IsArray, IsBoolean, IsMongoId, IsNotEmpty } from "class-validator"
import mongoose from "mongoose"

export class CreateRoleDto {
    @IsNotEmpty({ message: "name Không được để trống" })
    name: string

    @IsNotEmpty({ message: "description Không được để trống" })
    description: string

    @IsNotEmpty({ message: "isActive Không được để trống" })
    @IsBoolean({ message: "isActive có giá trị  boolean" })
    isActive: boolean

    @IsNotEmpty({ message: "permission Không được để trống" })
    @IsMongoId({ each: true, message: "Each permission la mongo object ID" })
    @IsArray({ message: "Permission có định dạng là array" })
    permissions: mongoose.Schema.Types.ObjectId[]
}
