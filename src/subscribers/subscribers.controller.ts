import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { IUser } from 'src/users/user.interface';
import { ResponseMessage, SkipCheckPermission, User } from 'src/decorator/customize.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('subscribers')
@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) { }

  @ResponseMessage("create a subscriber")
  @Post()
  create(@Body() createSubscriberDto: CreateSubscriberDto, @User() user: IUser) {
    return this.subscribersService.create(createSubscriberDto, user);
  }

  @Post("skills")
  @ResponseMessage("Get subscriber's skills")
  @SkipCheckPermission()
  getUserSkills(@User() user: IUser) {
    return this.subscribersService.getSkills(user);
  }

  @Get()
  @ResponseMessage("get all subscriber with paginate")
  findAll(
    @Query('current') currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string,) {
    return this.subscribersService.findAll(+currentPage, +limit, qs);
  }

  @ResponseMessage("find subscriber by Id")
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscribersService.findOne(id);
  }

  @Patch()
  @ResponseMessage("updated subscriber")
  @SkipCheckPermission()
  update(@Body() updateSubscriberDto: UpdateSubscriberDto, @User() user: IUser) {
    return this.subscribersService.update(updateSubscriberDto, user);
  }

  @ResponseMessage("delete subscriber")
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.subscribersService.remove(id, user);
  }
}
