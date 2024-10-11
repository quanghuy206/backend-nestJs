import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { log } from 'console';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { Company, CompanyDocument } from 'src/companies/schemas/company.schema';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,

    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,

    @InjectModel(Company.name)
    private companyModel: SoftDeleteModel<CompanyDocument>
  ) { }

  async create(createJobDto: CreateJobDto, user: IUser) {
    const { name, skills, company, salary, quantity, level, description, startDate, endDate, isActive, location } = createJobDto
    let newJob = await this.jobModel.create({
      name, skills, company, salary, quantity,
      level, description, startDate, endDate, isActive, location,
      createdBy: {
        _id: user._id,
        name: user.name
      }
    })
    return {
      _id: newJob?._id,
    }

  }

  async findAll(currentPage: number, limit: number, qs: string, user: IUser) {
    const { filter, sort, projection, population } = aqp(qs)
    delete filter.current;
    delete filter.pageSize;
    let offset = (currentPage - 1) * (limit);
    let defaultLimit = limit ? limit : 10;
    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    // const getInfoUser = await this.userModel.findOne({ _id: user._id })

    const result = await this.jobModel.find(filter)
      .limit(defaultLimit)
      .skip(offset)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .populate(population)
      .exec();
    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result
    }
  }
  //Find All Job By User Role such as : Role User,ADmin or HR
  async fetchJobByUser(currentPage: number, limit: number, qs: string, user: IUser) {
    const { filter, sort, projection, population } = aqp(qs)
    delete filter.current;
    delete filter.pageSize;
    let offset = (currentPage - 1) * (limit);
    let defaultLimit = limit ? limit : 10;
    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    // get info user to get company
    const getInfoUser = await this.userModel.findOne({ _id: user._id })
    if (getInfoUser?.company?._id) {
      const idCompany = getInfoUser.company._id;
      filter['company._id'] = idCompany;
    }

    const result = await this.jobModel.find(filter)
      .limit(defaultLimit)
      .skip(offset)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .populate(population)
      .exec();
    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result
    }
  }

  //Find Job by companyId 
  async fetchJobByCompanyId(companyId: string) {
    const totalItems = (await this.jobModel.find({ 'company._id': companyId })).length;
    // get info user to get company
    const result = await this.jobModel.find({ 'company._id': companyId })
    return {
      meta: {
        total: totalItems
      },
      result
    }
  }

  async findOne(id: string) {
    return await this.jobModel.findById({ _id: id });
  }

  async update(_id: string, updateJobDto: UpdateJobDto, user: IUser) {
    return await this.jobModel.updateOne(
      { _id },
      {
        ...updateJobDto,
        updatedBy: {
          _id: user._id,
          name: user.name
        }
      }
    )
  }

  async remove(_id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      return `not found user`;
    await this.jobModel.updateOne(
      { _id: _id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return this.jobModel.softDelete({
      _id: _id,
    })
  }
}
