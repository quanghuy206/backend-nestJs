import { PartialType } from '@nestjs/mapped-types';
import { CreateJobDto } from './create-job.dto';
import { IsEmpty } from 'class-validator';

export class UpdateJobDto extends PartialType(CreateJobDto) {
    @IsEmpty({ message: "Id không được để trống" })
    _id: string
}


