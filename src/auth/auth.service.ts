import { Injectable } from '@nestjs/common';
import { CredentialsDto } from 'src/DTOs/credentials.dto';
import { MongoService } from 'src/MongoDB/app.service';
import { Emailservice } from 'src/Mailer/app.service';
import { DetailsDto } from 'src/DTOs/details.dto';
import { OtpDto } from 'src/DTOs/otp.dto';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AuthService {

  constructor(private readonly mongoService: MongoService,
    private readonly emailService:Emailservice) {}

    //.............................................................................................................................

  async details_passed(details : DetailsDto) : Promise<any> {
    try{
    if( await this.mongoService.user_sign_up_completed(details.email) ){
      return {
        "status":0,
        "message":"User Already Signed Up"
      };
    }else if( await this.mongoService.user_sign_up_incompleted(details.email) ){
      var attempts_updated = await this.mongoService.update_pending_user_attempts(details);
      var details_updated = await this.mongoService.update_pending_user_details(details);
      if( attempts_updated.acknowledged && details_updated.acknowledged ){  
          return await this.email_passed_for_signup(details.email);
      }else{
        return {
          "status":0,
          "message":"User not Updated"
        };
      }
    }else{
      var attempts_inserted = await this.mongoService.insert_pending_user_attempts(details);
      var details_inserted = await this.mongoService.insert_pending_user_details(details);
      if( attempts_inserted.acknowledged && details_inserted.acknowledged ){  
      return await this.email_passed_for_signup(details.email);
      }else{
        return {
          "status":0,
          "message":"User not Generated"
        };
      }
    } 
  }catch{
    return {
      "status":900,
      "message":"Server Error"
    };
  }
  }
  
  //................................................................................................................................

  async email_passed_for_signup( email : string ) : Promise<any> {
    try{
      if( !await this.mongoService.user_sign_up_incompleted(email)) {
        return {
          "status":0,
          "message":"User Not Found"
        };  
      }else{
        var attempts = await this.mongoService.fetch_unregistered_count(email);
        if( attempts['otp-resend'] > 0 && attempts['otp-verify'] > 0 ){
          await this.mongoService.update_unregistered_resend_count(email);
          var otp = await this.emailService.send_email(email);
          if(otp == 400){
            await this.mongoService.delete_attempts(email);
            await this.mongoService.delete_details(email);
            return {
              "status":0,
              "message":"Invalid Email"
            };
          }else{
            await this.mongoService.update_unregistered_otp(email,otp);
            return {
              "status":101,
              "message":"OTP Sent"
            };
          }
        }else{
          return {
            "status":0,
            "message":"Daily OTP Limit Exceeded"
          };
        }
      }
    }catch{
      return {
        "status":900,
        "message":"Server Error"
      };
    }
  }

  //..............................................................................................................................
 
  async otp_passed_for_signup( verificator : OtpDto ) : Promise<any> {
    try{
      //getting recent info
      var attempts = await this.mongoService.fetch_attempts(verificator.email);
      var details = await this.mongoService.fetch_details(verificator.email);
      
      if( attempts['otp-verify']>0 ){

        if( await this.mongoService.match_unregistered_otp(verificator.email,Number(verificator.otp)) ){
          
          //inserting in registered users
          var bool1 = await this.mongoService.reinsert_attempts(attempts);
          var bool2 = await this.mongoService.reinsert_details(details);
          var bool3 = await this.mongoService.reinsert_credentials({
            "email":verificator.email,
            "password":verificator.password
          });
          
          //deleting from unregisrtered database
          await this.mongoService.delete_attempts(verificator.email);
          await this.mongoService.delete_details(verificator.email);
          
          if( bool1.acknowledged && bool2.acknowledged && bool3.acknowledged ){
            return {
              "status":102,
              "message":"Signed Up"
            };
          }else{
            return {
              "status":0,
              "message":"Unable to Sign-Up"
            };
          }
          
        }else{
          await this.mongoService.update_unregistered_verify_count(verificator.email);
          return {
            "status":0,
            "message":"Incorrect OTP"
          };
        }

      }else{
        return {
          "status":0,
          "message":"Daily Incorrect Limit Exceeded"
        };
      }

      }catch{
      return {
        "status":900,
        "message":"Server Error"
      };
    }
  }
  
  //................................................................................................................

  async email_passed_for_reset( email : string) :Promise<any> {
    try{
      if( !await this.mongoService.user_sign_up_completed(email)) {
        return {
          "status":0,
          "message":"User Not Signed Up"
        };  
      }else{
        var attempts = await this.mongoService.fetch_registered_count(email);
        if( attempts['otp-resend'] > 0 && attempts['otp-verify'] > 0 ){
          await this.mongoService.update_registered_resend_count(email);
          var otp = await this.emailService.send_email(email);
          if(otp == 400){
            return {
              "status":0,
              "message":"Invalid Email"
            };
          }else{
            await this.mongoService.update_registered_otp(email,otp);
            return {
              "status":103,
              "message":"OTP Sent"
            };
          }
        }else{
          return {
            "status":0,
            "message":"Daily OTP Limit Exceeded"
          };
        }
      }
    }catch{
      return {
        "status":900,
        "message":"Server Error"
      };
    }
  }

  //................................................................................................................

  async otp_passed_for_reset( verificator : OtpDto ) : Promise<any> {
    try{
      //getting recent info
      var attempts = await this.mongoService.fetch_registered_count(verificator.email);
      
      if( attempts['otp-verify']>0 ){

        if( await this.mongoService.match_registered_otp(verificator.email,Number(verificator.otp)) ){
          
          if( await this.mongoService.update_credentials(verificator.email,verificator.password) ){
            return {
              "status":104,
              "message":"Password Updated"
            };
          }else{
            return {
              "status":0,
              "message":"Unable to Update Password"
            };
          }
          
        }else{
          await this.mongoService.update_registered_verify_count(verificator.email);
          return {
            "status":0,
            "message":"Incorrect OTP"
          };
        }

      }else{
        return {
          "status":0,
          "message":"Daily Incorrect Limit Exceeded"
        };
      }

      }catch{
      return {
        "status":900,
        "message":"Server Error"
      };
    }
  }
  
  //................................................................................................................................
  

  async credentials_passed(credentials:CredentialsDto) :Promise<any> {
    try{
      if( await this.mongoService.user_credentials_match(credentials) ){
        return {
          "status":108,
          "message":"User Validated"
        };  
      }else if( await this.mongoService.user_sign_up_completed(credentials.email)){
        return {
          "status":0,
          "message":"Incorrect Password"
        };
      }else{
        return {
          "status":0,
          "message":"User Not Found"
        };  
      }
    }catch{
      return {
        "status":900,
        "message":"Server Error"
      };
    }
  }

  //everyday 00:01:01 resets the attempts to 3
  @Cron('1 1 0 * * *')
  async reset_attempts() {
    await this.mongoService.update_all_unregistered_attempts();
    await this.mongoService.update_all_registered_attempts();
  }

}  