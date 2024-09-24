import { IsMongoId, IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateResumeDto {
    @IsNotEmpty({ message: "Url không được để trống" })
    url: string;

    @IsNotEmpty({ message: "Url không được để trống" })
    status: string;

    @IsNotEmpty({ message: "Url không được để trống" })
    companyId: mongoose.Schema.Types.ObjectId

    @IsNotEmpty({ message: "Url không được để trống" })
    jobId: mongoose.Schema.Types.ObjectId

}

export class CreateUserCvDto {
    @IsNotEmpty({ message: "Url không được để trống" })
    url: string;

    @IsNotEmpty({ message: "Url không được để trống" })
    @IsMongoId({ message: "companyId is a mongoId" })
    companyId: mongoose.Schema.Types.ObjectId

    @IsNotEmpty({ message: "Url không được để trống" })
    @IsMongoId({ message: "jobId is a mongoId" })
    jobId: mongoose.Schema.Types.ObjectId
}
