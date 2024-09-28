import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { Subscriber, SubscriberDocument } from './schemas/subscriber.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/users/user.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectModel(Subscriber.name)
    private subcriberModel: SoftDeleteModel<SubscriberDocument>
  ) { }

  async create(createSubscriberDto: CreateSubscriberDto, user: IUser) {
    const { name, email, skills } = createSubscriberDto
    const isExist = await this.subcriberModel.findOne({ email })
    if (isExist) {
      throw new BadRequestException(`Email ${email} đã tồn tại vui lòng dùng một email khác`)
    }
    let newSubs = await this.subcriberModel.create({
      name, email, skills,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return {
      _id: newSubs._id,
      createdBy: newSubs?.createdAt
    }
  }

  async getSkills(user: IUser) {
    const { email } = user;
    return await this.subcriberModel.findOne({ email }, { skills: 1 })
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs)
    delete filter.current;
    delete filter.pageSize;
    let offset = (currentPage - 1) * (limit);
    let defaultLimit = limit ? limit : 10;
    const totalItems = (await this.subcriberModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.subcriberModel.find(filter)
      .limit(defaultLimit)
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

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Không tìm thấy subscriber")
    }

    return await this.subcriberModel.findOne({ _id: id })
  }

  async update(updateSubscriberDto: UpdateSubscriberDto, user: IUser) {
    const updated = await this.subcriberModel.updateOne(
      { email: user.email },
      {
        ...updateSubscriberDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      },
      { upsert: true } // chưa có thì tạo - có rồi thì bỏ qua
    )
    return updated
  }

  async remove(id: string, user: IUser) {
    await this.subcriberModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return this.subcriberModel.softDelete({ _id: id })
  }
}
