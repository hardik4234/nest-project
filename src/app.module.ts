import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseConnector } from './MongoDB/app.connection';
import { MongoService } from './MongoDB/app.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { Emailservice } from './Mailer/app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JWTService } from './JWT/jwt.service';
import { JWTController } from './JWT/jwt.controller';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ConfigModule.forRoot(),DatabaseConnector,ScheduleModule.forRoot(),
    MailerModule.forRoot({
      transport: {
        host: process.env.SENDER_HOST,
        port: process.env.SENDER_PORT,
        auth: {
          user: process.env.SENDER_EMAIL,
          pass: process.env.SENDER_PASSWORD,
        }
      }
    })],
  controllers: [AppController,AuthController,JWTController],
  providers: [AppService,AuthService,MongoService,Emailservice,JWTService],
})
export class AppModule {}
