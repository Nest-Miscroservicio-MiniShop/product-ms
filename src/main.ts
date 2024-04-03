import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config/envs';
//!npm i --save @nestjs/microservices
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Main');
  //*De esta forma es como convertimos nuestro servicio rest a microservicio usando TCP como transporte
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule,
    {
      transport: Transport.TCP,
      options:{
        port: envs.port
      }
    },);
  app.useGlobalPipes(
    new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    })
   );
   //*AL convertir en microservicio ya no es necesario un puerto
  await app.listen();
  logger.log(`Products microservice corriendo en el puerto ${envs.port}`)
  
}
bootstrap();
