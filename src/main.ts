import cookieParser from 'cookie-parser';  // Default import
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { TransformInterceptor } from './core/transform.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  //On OFF Guard 
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  app.useStaticAssets(join(__dirname, '..', 'public')); //js, css, images
  app.setBaseViewsDir(join(__dirname, '..', 'views')); //view 
  app.setViewEngine('ejs');


  app.useGlobalPipes(new ValidationPipe(
    { whitelist: true } //param inheritance still not updated
  ));

  //config cookie 
  app.use(cookieParser());

  //config Cors
  app.enableCors(
    {
      "origin": true,
      "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      "preflightContinue": false,
      credentials: true //accept client and server talk together
    }
  );
  //Config versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1', '2']
  });

  const config = new DocumentBuilder()
    .setTitle('Nest JS Series API Document')
    .setDescription('All Module APIs')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'Bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'token',
    )
    .addSecurityRequirements('token')
    // .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persitsAuthorization: true,
    }
  });


  await app.listen(configService.get<string>('PORT'));
}
bootstrap();
