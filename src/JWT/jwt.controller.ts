import { Controller, Get, Req, Res, Body, Post} from '@nestjs/common';
import { Request, Response } from 'express';
import { JWTService } from './jwt.service';

@Controller('jwt')
export class JWTController {

  constructor(private readonly jwtService: JWTService) {}

  @Post('login')
  async token( @Body() obj: object, @Res() response_out: Response) :Promise<any> {
    if( !obj || !obj['token'] ){
        response_out.json({
            "status":0,
            "message":"Token Missing"
        });
    }else{
        response_out.json( await this.jwtService.verify_AT(obj['token']) );
    }
  }
  
}