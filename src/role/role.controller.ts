import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { IUser } from 'src/users/user.interface';
import { ResponseMessage, User } from 'src/decorator/customize.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('roles')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @Post()
  @ResponseMessage("Create a new Role")
  create(@Body() createRoleDto: CreateRoleDto, @User() user: IUser) {
    return this.roleService.create(createRoleDto, user);
  }

  @Get()
  @ResponseMessage("find All Role with pagination")
  findAll(
    @Query('current') currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string,
  ) {
    return this.roleService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage("find Role by Id")
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage("Update Role by id")
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto, @User() user: IUser) {
    return this.roleService.update(id, updateRoleDto, user);
  }

  @Delete(':id')
  @ResponseMessage("Delete a Role ")
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.roleService.remove(id, user);
  }
}
