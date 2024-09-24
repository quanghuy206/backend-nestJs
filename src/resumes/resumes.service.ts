import { Injectable } from '@nestjs/common';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class ResumesService {

  constructor(
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>
  ) { }

  async create(createUserCvDto: CreateUserCvDto, user: IUser) {
    const { url, companyId, jobId } = createUserCvDto
    const { email, _id } = user

    const newCv = await this.resumeModel.create({
      url, companyId, jobId, email,
      userId: _id,
      status: "PENDING",
      history: [
        {
          status: "PENDING",
          updatedAt: new Date,
          updatedBy: {
            _id: user._id,
            email: user.email
          }
        }
      ],
      createdBy: {
        _id, email
      }
    })
    return {
      _id: newCv._id,
      createdAt: newCv.createdAt
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs)
    delete filter.current;
    delete filter.pageSize;
    let offset = (currentPage - 1) * (limit);
    let defaultLimit = limit ? limit : 10;
    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.resumeModel.find(filter)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
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

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return `not found user`;

    return await this.resumeModel.findOne({ _id: id })
  }

  async update(id: string, status: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return `not found user`;

    const updated = await this.resumeModel.updateOne(
      { _id: id },
      {
        status,
        updatedBy: {
          _id: user._id,
          email: user.email
        },
        $push: {
          history: {
            status: status,
            updatedAt: new Date,
            updatedBy: {
              _id: user._id,
              email: user.email
            },
          }
        }
      }
    )
    return updated
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return `not found resume`;
    await this.resumeModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }

    )
    return this.resumeModel.softDelete({ _id: id })
  }

  async findByUsers(user: IUser) {
    return await this.resumeModel.find({
      userId: user._id
    })
      .sort("-createdAt")
      .populate([
        {
          path: "companyId",
          select: { name: 1 }
        },
        {
          path: "jobId",
          select: { name: 1 }
        }
      ])
  }
}
