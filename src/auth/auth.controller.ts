import { Controller, Get, Post, Req, Res, Param ,Query,Body} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { Request, Response } from 'express';
import { MongoService } from 'src/MongoDB/app.service';
import { Emailservice } from 'src/Mailer/app.service';
import { DetailsDto } from 'src/DTOs/details.dto';
import { OtpDto } from 'src/DTOs/otp.dto';
import { CredentialsDto } from 'src/DTOs/credentials.dto';
import { ResetDto } from 'src/DTOs/reset.dto';
import { DataDto } from 'src/DTOs/data.dto';
import { JWTService } from 'src/JWT/jwt.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly mongoService: MongoService,
    private readonly jwtService:JWTService) {}

  @Post('generate')
  async sign_up(@Body() details : DetailsDto, @Res() response_out: Response) :Promise<any>{
    try{
      if( !details || ( !details.email && !details.fname && !details.lname ) ){
        response_out.json({
          "status":0,
          "message":"Mandatory Data Missing"
        });
      }else if( !details.email && !details.fname ){
        response_out.json({
          "status":0,
          "message":"Email and First Name Missing"
        });
      }else if( !details.email &&  !details.lname ){
        response_out.json({
          "status":0,
          "message":"Email and Last Name Missing"
        });
      }else if( !details.fname && !details.lname ){
        response_out.json({
          "status":0,
          "message":"First Name and Last Name Missing"
        });
      }else if( !details.email ){
        response_out.json({
          "status":0,
          "message":"Email Missing"
        });
      }else if( !details.fname ){
        response_out.json({
          "status":0,
          "message":"First Name Missing"
        });
      }else if( !details.lname ){
        response_out.json({
          "status":0,
          "message":"Last Name Missing"
        });
      }else{
        var result = await this.authService.details_passed(details);
        if(result.status == 101){
          response_out.cookie('mode','signup',{ maxAge: 5*1000 });
          response_out.cookie('email',details.email,{ maxAge: 5*1000 });
        }
        response_out.json(result);
      }
    }catch{
      response_out.json({
        "status":999,
        "message":"Server Error"
      });
    }   
  }

  //..........................................................................................................................

  
  @Post('resend')
  async password_reset(@Body() reset : ResetDto, @Res() response_out : Response) : Promise<any> {
    try{
      if( !reset || (!reset.email && !reset.mode) ){
        response_out.json({
          "status":0,
          "message":"Email and Mode Missing"
        });
      }else if( !reset.email ){
        response_out.json({
          "status":0,
          "message":"Email Missing"
        });
      }else if( !reset.email ){
        response_out.json({
          "status":0,
          "message":"Mode Missing"
        }); 
      }else{
        if( reset.mode == "signup"){
          response_out.json(await this.authService.email_passed_for_signup(reset.email) );
        }
        if( reset.mode == "reset"){
          response_out.cookie('mode','reset',{ maxAge: 5*1000 });
          response_out.cookie('email',reset.email,{ maxAge: 5*1000 });
          response_out.json(await this.authService.email_passed_for_reset(reset.email));
        }
      }
    }catch{
      response_out.json({
        "status":999,
        "message":"Server Error"
      });
    }
  }

//..............................................................................................................
  

  @Post('register')
  async verify( @Body() verificator : OtpDto , @Res() response_out : Response ) : Promise<any> {
    try{
      if( !verificator || ( !verificator.otp && !verificator.email && !verificator.password ) ){
        response_out.json({
          "status":0,
          "message":"OTP, Email and Password Missing"
        });
      }else if( !verificator.otp && !verificator.email ){
        response_out.json({
          "status":0,
          "message":"OTP and Email Missing"
        });
      }else if( !verificator.otp && !verificator.password ){
        response_out.json({
          "status":0,
          "message":"OTP and Password Missing"
        });
      }else if( !verificator.email && !verificator.password ){
        response_out.json({
          "status":0,
          "message":"Email and Password Missing"
        });
      }else if( !verificator.otp ){
        response_out.json({
          "status":0,
          "message":"OTP Missing"
        });
      }else if( !verificator.email ){
        response_out.json({
          "status":0,
          "message":"Email Missing"
        });
      }else if( !verificator.password ){
        response_out.json({
          "status":0,
          "message":"Password Missing"
        });
      }else{
        var data;
        if( verificator.mode == "signup" ){
          data = await this.authService.otp_passed_for_signup(verificator); 
        }else if( verificator.mode == "reset" ){
          data = await this.authService.otp_passed_for_reset(verificator);
        }
        if( data.status === 102  || data.status === 104 ){
          var token = await this.jwtService.generate_AT(verificator.email);
          response_out.cookie('token',token,{ maxAge: 1000*60*60*10 });
        }
        response_out.json( data );
      }
    }catch{
      response_out.json({
        "status":999,
        "message":"Server Error"
      });
    }
  }
  
  //........................................................................................

  
  @Post('login')
  async sign_in(@Body() credentials : CredentialsDto,@Res() response_out: Response) : Promise<any> {
    try{
      if( !credentials || ( !credentials.email && !credentials.password ) ){
        response_out.json({
          "status":0,
          "message":"Email and Password Missing"
        });
      }else if( !credentials.email ){
        response_out.json({
          "status":0,
          "message":"Email Missing"
        });
      }else if( !credentials.password ){
        response_out.json({
          "status":0,
          "message":"Password Missing"
        });
      }else{
        var result = await this.authService.credentials_passed(credentials);
        if( result.status==108 ){
          var token = await this.jwtService.generate_AT(credentials.email);
          response_out.cookie('token',token,{ maxAge: 1000*60*60*10 });
        }
        response_out.json(result);
      }
    }catch{
      response_out.json({
        "status":999,
        "message":"Server Error"
      });
    }
  }
  
  //..........................................................................................................................

  @Post('cookie/tool')
  async tool_cookie(@Body() info : DataDto,@Res() response_out: Response) : Promise<any> {
    try{
      if( !info || !info.data ){
        response_out.json({
          "status":0,
          "message":"Data Missing"
        });
      }else{
        response_out.cookie('tool',info.data,{ maxAge: 1000*60*60*24 });
        response_out.json({
          "status":234,
          "message":"Cookie Set"
        });
      }
    }catch{
      response_out.json({
        "status":999,
        "message":"Server Error"
      });
    }
  }

  @Post('cookie/page')
  async page_cookie(@Body() info : DataDto,@Res() response_out: Response) : Promise<any> {
    try{
      if( !info || !info.data ){
        response_out.json({
          "status":0,
          "message":"Data Missing"
        });
      }else{
        response_out.cookie('page',info.data,{ maxAge: 1000*60*60*24 });
        response_out.json({
          "status":234,
          "message":"Cookie Set"
        });
      }
    }catch{
      response_out.json({
        "status":999,
        "message":"Server Error"
      });
    }
  }

  //................................................................................................

  @Get('working')
  async demo(){
    await this.mongoService.demo_func();
    return;
  }

  @Get('rename')
  async rename(){
    await this.mongoService.demo_rename();
    return;
  }

  @Get('remove')
  async remove(){
    await this.mongoService.demo_remove();
    return;
  }
  
}
