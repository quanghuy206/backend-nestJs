import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize.decorator';
import { IUser } from 'src/users/users.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }


  @Post()
  @ResponseMessage("Create a new User")
  async create(@Body() createJobDto: CreateJobDto, @User() user: IUser) {
    return await this.jobsService.create(createJobDto, user);
  }

  @Get()
  @Public()
  @ResponseMessage("Fetch job with pagination")
  findAll(
    @Query('current') currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string,
    @User() user: IUser
  ) {
    return this.jobsService.findAll(+currentPage, +limit, qs, user);
  }

  @Get('by-user-role')
  @ResponseMessage("Fetch job with pagination By User Role")
  fetchJobWithUser(
    @Query('current') currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string,
    @User() user: IUser
  ) {
    return this.jobsService.fetchJobByUser(+currentPage, +limit, qs, user);
  }

  @Get('companyId/:id')
  @Public()
  @ResponseMessage("Fetch job with pagination By CompanyId")
  fetchJobByCompanyId(
    @Param('id') companyId: string, // Lấy 'id' từ URL
  ) {
    return this.jobsService.fetchJobByCompanyId(companyId);
  }


  @Get(':id')
  @Public()
  @ResponseMessage("find a job")
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage("update a job")
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto, @User() user: IUser) {
    return this.jobsService.update(id, updateJobDto, user);
  }

  @Delete(':id')
  @ResponseMessage("delete a job")
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.jobsService.remove(id, user);
  }
}
