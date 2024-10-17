import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize.decorator';
import { IUser } from 'src/users/users.interface';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) { }

  @Post()
  @ResponseMessage("create a Article")
  create(@Body() createArticleDto: CreateArticleDto, @User() user: IUser) {
    return this.articlesService.create(createArticleDto, user);
  }

  @Get()
  @ResponseMessage("fetch all Article with paginate")
  @Public()
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string
  ) {
    return this.articlesService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage("find Article by id")
  @Public()
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage("updated Article")
  update(@Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @User() user: IUser) {
    return this.articlesService.update(id, updateArticleDto, user);
  }

  @Delete(':id')
  @ResponseMessage("deleted Article")
  remove(
    @Param('id') id: string,
    @User() user: IUser
  ) {
    return this.articlesService.remove(id, user);
  }
}
