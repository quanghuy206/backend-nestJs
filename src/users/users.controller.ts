import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize.decorator';
import { IUser } from './user.interface';

@Controller('users') // => /users
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ResponseMessage("Create a new User")
  async create(@Body() bodyUser: CreateUserDto, @User() user: IUser) {
    let newUser = await this.usersService.create(bodyUser, user);
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt
    }

  }

  @Public()
  @ResponseMessage("Fetch user by id with pagination")
  @Get()
  findAll(
    @Query('current') currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string,
  ) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @ResponseMessage("Fetch user by Id")
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }



  @Patch()
  @ResponseMessage("Update success !")
  async update(@Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    let newUser = await this.usersService.update(updateUserDto, user);
    return newUser

  }

  @Delete(':id')
  @ResponseMessage("Delete Success !")
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(id, user);
  }
}
