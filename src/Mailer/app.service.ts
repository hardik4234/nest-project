import { Injectable, Inject } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { MongoService } from 'src/MongoDB/app.service';
@Injectable()
export class Emailservice {

  constructor(private mailService: MailerService,
    private readonly mongoService: MongoService) {}

  async send_email( email : string ) : Promise<any> {
    try{
      var otp = 0;
      //console.log("Generating OTP...");
      do{
        otp=Math.round(Math.random()*1000000);
      }while( otp < 100000 )
      //console.log("OTP Generated");
      //console.log(otp);
      //console.log("Sending Email...");
      var status = await this.mailService.sendMail({
        to: email,
        from: process.env.SENDER_EMAIL,
        subject: `RelaxHardy.com Login OTP`,
        text: `Hi,\nYour OTP to login to RelaxHardy.com is ${otp}`,
      });
      if(status){
        return otp;
      }
      //console.log("Email Sent");
    }catch{
      return 400;
    }
  }
}