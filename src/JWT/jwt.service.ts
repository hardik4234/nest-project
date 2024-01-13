import { Injectable } from '@nestjs/common';
const JWT = require('jsonwebtoken');

@Injectable()
export class JWTService {

  constructor() { }

  async generate_AT(email: string): Promise<string> {               //generating Access Token
    let payload = {
      "sub": "Access Token",
      "iss": "relaxhardy.com",
      "aud": email
    };
    return await JWT.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "60s" });
  }

  async verify_AT(token: string): Promise<any> {              //verifying Refresh Token and returns payload
    try {
      if (await JWT.verify(token, process.env.ACCESS_TOKEN_SECRET)) {
        return {
          "status": 109,
          "message": "Token Verified"
        };
      }else{
        return {
          "status": 0,
          "message": "Token Invalid"
        };
      }
    } catch {
      return {
        "status": 0,
        "message": "Token Expired"
      };
    }
  }

}  