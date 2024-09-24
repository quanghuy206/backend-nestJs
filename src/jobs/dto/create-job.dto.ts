import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsDefined, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, Validate, ValidateNested } from "class-validator";
import mongoose from "mongoose";

class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    logo: string;
}

export class CreateJobDto {
    @IsNotEmpty({ message: 'Name không được để trống', })
    name: string;

    @IsNotEmpty({ message: "skill không được để trống" })
    @IsArray({ message: "skill định dàng là array" })
    @IsString({ each: true, message: "skill định dạng là string" })
    skills: string[];

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company!: Company;

    @IsNotEmpty({ message: 'salary không được để trống', })
    salary: string;

    @IsNotEmpty({ message: 'location không được để trống', })
    location: string;

    @IsNotEmpty({ message: 'quantity không được để trống', })
    quantity: string;

    @IsNotEmpty({ message: 'level không được để trống', })
    level: string;

    @IsNotEmpty({ message: 'description không được để trống', })
    description: string;

    @IsNotEmpty({ message: 'startDate không được để trống', })
    @Transform(({ value }) => new Date(value))
    @IsDate({ message: 'startDate có định dạng là Date' })
    startDate: Date;

    @IsNotEmpty({ message: 'endDate không được để trống', })
    @Transform(({ value }) => new Date(value))
    @IsDate({ message: 'endDate có định dạng là Date' })
    endDate: Date;

    @IsBoolean({ message: "Active không được để trống" })
    isActive: boolean

}
