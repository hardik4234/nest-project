import { Controller, Get, Req, Res, Body} from '@nestjs/common';
import { Request, Response } from 'express';
import { JWTService } from './JWT/jwt.service';

@Controller()
export class AppController {

  constructor(private readonly jwtService: JWTService) {}

  @Get()
  async render_working_page( @Req() request_in : Request, @Res() response_out: Response) {
    response_out.sendFile(process.cwd()+'/Interface/pages/welcome.html');
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
  
  @Get('home')
  async render_home( @Req() request_in : Request, @Res() response_out: Response) {
    response_out.sendFile(process.cwd()+'/Interface/pages/template.html');
  }
}