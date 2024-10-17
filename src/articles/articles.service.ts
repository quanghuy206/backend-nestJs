import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Article, ArticleDocument } from './schemas/article.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class ArticlesService {

  constructor(
    @InjectModel(Article.name)
    private articleModel: SoftDeleteModel<ArticleDocument>
  ) { }

  async create(createArticleDto: CreateArticleDto, user: IUser) {
    let article = await this.articleModel.create({
      ...createArticleDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return article
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.articleModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.articleModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException("Not found Id")
    return await this.articleModel.findById(id);

  }

  async update(id: string, updateArticleDto: UpdateArticleDto, user: IUser) {
    return await this.articleModel.updateOne(
      { _id: id },
      {
        ...updateArticleDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      });
  }

  async remove(id: string, user: IUser) {
    await this.articleModel.updateOne(
      { _id: id },
      {
        deletedBy:
          { _id: user._id, email: user.email }
      })
    return this.articleModel.softDelete({ _id: id })
  }
}
