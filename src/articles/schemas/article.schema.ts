import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type ArticleDocument = HydratedDocument<Article>;

@Schema({ timestamps: true })
export class Article {

    @Prop()
    title: string;

    @Prop()
    content: string;

    @Prop()
    author: string;

    @Prop()
    summary: string;

    @Prop()
    logo: string;

    @Prop()
    category: string;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

    @Prop({ type: Object })
    createdBy: {
        _id: mongoose.Schema.Types.ObjectId,
        email: string
    };

    @Prop({ type: Object })
    updatedBy: {
        _id: mongoose.Schema.Types.ObjectId,
        email: string
    };

    @Prop({ type: Object })
    deletedBy: {
        _id: mongoose.Schema.Types.ObjectId,
        email: string
    };


}

export const ArticleSchema = SchemaFactory.createForClass(Article);