import { Controller, Get, Req, Res, Body, Post} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryDto } from 'src/DTOs/query.dto';
import { MongoService } from 'src/MongoDB/app.service';
import { JWTService } from './JWT/jwt.service';

@Controller()
export class AppController {

  constructor(private readonly mongoService: MongoService,
    private readonly jwtService: JWTService) {}

  @Get()
  async render_working_page( @Req() request_in : Request, @Res() response_out: Response) {
    response_out.sendFile(process.cwd()+'/Interface/main.html');
  }
  
  @Get('sign-in')
  async render_sign_in( @Req() request_in : Request, @Res() response_out: Response) {
    response_out.sendFile(process.cwd()+'/Interface/auth/sign-in.html');
  }
  
  @Get('sign-up')
  async render_sign_up( @Req() request_in : Request, @Res() response_out: Response) {
    response_out.sendFile(process.cwd()+'/Interface/auth/sign-up.html');
  }
  
  @Get('verify-email')
  async render_verify_email( @Req() request_in : Request, @Res() response_out: Response) {
    response_out.sendFile(process.cwd()+'/Interface/auth/verification.html');
  }

  @Post('query')
  async query(@Body() query_data : QueryDto, @Res() response_out: Response) :Promise<any>{
    if( !query_data || !query_data.name || !query_data.email || !query_data.data ){
      response_out.json({
        "status":0,
        "message":"Incomplete Data"
      });
    }else if(await this.mongoService.query(query_data)){
      response_out.json({
        "status":333,
        "message":"Done"
      });
    }
  } 
}
