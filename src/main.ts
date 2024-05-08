import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config/envs';
//!npm i --save @nestjs/microservices
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('ProductsMS-Main');

  console.log(envs.natsServers);

  //*De esta forma es como convertimos nuestro servicio rest a microservicio usando TCP como transporte
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule,
    {
      //transport: Transport.TCP, -> Conexion con TCP
      transport: Transport.NATS, //-> Conexion con NATS
      options:{
        //port: envs.port -> Puerto de nuestro microservicio
        servers: envs.natsServers //*servers recibe un arreglo de servidores NATS ['nats://localhost:4222','nats://localhost:4223'] 
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
