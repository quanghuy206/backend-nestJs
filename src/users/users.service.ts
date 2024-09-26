import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User as UserM, UserDocument } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './user.interface';
import aqp from 'api-query-params';
import { log } from 'console';
import { Role, RoleDocument } from 'src/role/schemas/role.schema';
import { USER_ROLE } from 'src/databases/sample';

@Injectable()
export class UsersService {

  constructor(
    @InjectModel(UserM.name)
    private userModel: SoftDeleteModel<UserDocument>,

    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>
  ) { }

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  }

  async create(bodyUser: CreateUserDto, user: IUser) {
    const { name, email, password, age, gender, address, role, company } = bodyUser
    const isExist = await this.userModel.findOne({ email })
    if (isExist) {
      throw new BadRequestException(`email ${email} đã tồn tại vui lòng nhập email khác`)
    }
    const hashPassword = this.getHashPassword(password);
    let newUser = await this.userModel.create({
      name, email,
      password: hashPassword,
      age, gender,
      address, role,
      company, createdBy: {
        _id: user._id,
        name: user.name
      }
    })
    return newUser;
  }

  async register(user: RegisterUserDto) {
    const { name, email, password, age, gender, address } = user
    const hashPassword = this.getHashPassword(password);
    const isExist = await this.userModel.findOne({ email })
    if (isExist) {
      throw new BadRequestException(`email ${email} đã tồn tại bạn vui lòng nhập email khác `)
    }
    const userRole = await this.roleModel.findOne({ name: USER_ROLE })

    let newUser = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      age,
      gender,
      address,
      role: userRole._id
    })
    return newUser;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs)
    delete filter.current;
    delete filter.pageSize;
    let offset = (currentPage - 1) * (limit);
    let defaultLimit = limit ? limit : 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel.find(filter)
      .select('-password')
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


  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return `not found user`;

    return this.userModel.findOne({
      _id: id
    }).select('-password')
      .populate({
        path: "role",
        select: { name: 1, _id: 1, }
      })
  }

  findOneByUsername(username: string) {
    return this.userModel.findOne({
      email: username
    }).populate({ path: "role", select: { name: 1 } })
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async update(updateUserDto: UpdateUserDto, user: IUser) {
    return await this.userModel.updateOne({ _id: updateUserDto._id },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      })
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return `not found user`;
    const foundUser = await this.userModel.findById(id);
    if (foundUser && foundUser.email === "admin@gmail.com") {
      throw new BadRequestException("Không thể xóa tài khoản admin!")
    }
    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return this.userModel.softDelete({
      _id: id
    })
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne(
      { _id },
      { refreshToken }
    )
  }

  findUserByToken = async (refreshToken: string) => {
    return (await this.userModel.findOne({ refreshToken })).populate({ path: "role", select: { name: 1 } })
  }
}
