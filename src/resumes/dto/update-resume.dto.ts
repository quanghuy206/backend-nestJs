import { PartialType } from '@nestjs/mapped-types';
import { CreateResumeDto } from './create-resume.dto';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

class UpdatedBy {
    @IsNotEmpty()
    _id: Types.ObjectId

    @IsNotEmpty()
    email: string
}

class History {
    status: string
    updatedAt: Date

    @IsNotEmpty({ message: 'UpdatedBy không được để trống' })
    @ValidateNested()
    @Type(() => UpdatedBy)
    updatedBy: UpdatedBy[]
}
export class UpdateResumeDto extends PartialType(CreateResumeDto) {
    @IsNotEmpty({ message: 'History Không được để trống' })
    @IsArray()
    @ValidateNested()
    @Type(() => History)
    history: History[]
}
