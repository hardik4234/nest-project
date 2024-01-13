import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
//import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //app.use(cookieParser());
  let port=process.env.LOCAL_HOST_PORT;
  await app.listen(port);
  console.log("...................................................")
  console.log(`http://localhost:${port}/`)
  console.log("...................................................")
}
bootstrap();