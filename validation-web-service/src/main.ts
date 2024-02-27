import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MulterModule } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});

  const config = new DocumentBuilder()
    .setTitle('/developers Product Admin Service')
    .setDescription(
      'The API specification of the API validation service. No additional authorization is required using this UI. ' +
        'This is a showcase utilizing Spectral and a custom ruleset.',
    )
    .setVersion('0.1')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  MulterModule.register({
    dest: './upload',
  });

  await app.listen(3000);
}
bootstrap();
