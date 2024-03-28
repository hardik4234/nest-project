import { Inject, Injectable } from '@nestjs/common';
import { MongoClient} from 'mongodb';
import { DetailsDto } from 'src/DTOs/details.dto';
import { CredentialsDto } from 'src/DTOs/credentials.dto';
import { QueryDto } from 'src/DTOs/query.dto';

@Injectable()
export class MongoService {

  constructor(
    @Inject('DATABASE_CONNECTION')
    private connect: MongoClient,
  ) {}

//.............................................................................................................................
  
  // checks the pair of email and password matches or not
  async user_credentials_match(credentials:CredentialsDto):Promise<any>{
    return await this.connect.db('user-registered').collection('credentials').findOne({"email":credentials.email,"password":credentials.password});
  }

  // finds user in signed up user(registered) data set
  async user_sign_up_completed(email: string):Promise<any>{
    return await this.connect.db('user-registered').collection('details').findOne({"email":email});
  }

  // finds user in incompleted user(unregistered) data set
  async user_sign_up_incompleted(email : string) : Promise<any> {
    return await this.connect.db('user-unregistered').collection('details').findOne({"email":email});
  }


//........................................................................................................


  // updates details collection of pending user(unregistered) data set
  async update_pending_user_details(details:DetailsDto) : Promise<any> {
    return await this.connect.db('user-unregistered').collection('details').updateOne({"email":details.email},{$set:{
      "email": details.email,
      "mobile": details.mobile,
      "first-name": details.fname,
      "last-name": details.lname,
      "gender": details.gender,
      "sign-up": "",
      "sign-in": "",
      "user-no": 0
    }});
  }

  // updates attempts collection of pending user(unregistered) data set
  async update_pending_user_attempts(details : DetailsDto) : Promise<any> {
    return await this.connect.db('user-unregistered').collection('attempts').updateOne({"email":details.email},{$set:{
      "mobile": details.mobile
    }});
  }

//................................................................................................................


  // inserts in details collection of pending user(unregistered) data set
  async insert_pending_user_details(details:DetailsDto) : Promise<any> {
    return await this.connect.db('user-unregistered').collection('details').insertOne({
      "email": details.email,
      "mobile": details.mobile,
      "first-name": details.fname,
      "last-name": details.lname,
      "gender": details.gender,
      "sign-up": "",
      "sign-in": "",
      "user-no": 0
    });
  }

  // inserts in attempts collection of pending user(unregistered) data set
  async insert_pending_user_attempts(details : DetailsDto) : Promise<any> {
    return await this.connect.db('user-unregistered').collection('attempts').insertOne({
      "email": details.email,
      "mobile": details.mobile,
      "otp-resend": 3,
      "otp-verify": 3,
      "otp": 0
    });
  }
  
//..........................................................................................................................
  
  async fetch_unregistered_count( email:string ) : Promise<any> {
    return await this.connect.db('user-unregistered').collection('attempts').findOne({"email":email});
  }

  async update_unregistered_resend_count( email:string ) : Promise<any> {
    return await this.connect.db('user-unregistered').collection('attempts').updateOne({"email":email},{$inc:{
      "otp-resend": -1
    }});
  }

  async update_unregistered_verify_count( email:string ) : Promise<any> {
    return await this.connect.db('user-unregistered').collection('attempts').updateOne({"email":email},{$inc:{
      "otp-verify": -1
    }});
  }

  async update_unregistered_otp(email:string,otp:number) : Promise<any> {
    return await this.connect.db('user-unregistered').collection('attempts').updateOne({"email":email},{$set:{
      "otp": otp
    }});
  }

  async match_unregistered_otp(email:string,otp:number) : Promise<any> {
    return await this.connect.db('user-unregistered').collection('attempts').findOne({"email":email,"otp": otp});
  }

  //..............................................................................................................

  async fetch_registered_count( email:string ) : Promise<any> {
    return await this.connect.db('user-registered').collection('attempts').findOne({"email":email});
  }

  async update_registered_resend_count( email:string ) : Promise<any> {
    return await this.connect.db('user-registered').collection('attempts').updateOne({"email":email},{$inc:{
      "otp-resend": -1
    }});
  }

  async update_registered_verify_count( email:string ) : Promise<any> {
    return await this.connect.db('user-registered').collection('attempts').updateOne({"email":email},{$inc:{
      "otp-verify": -1
    }});
  }

  async update_registered_otp(email:string,otp:number) : Promise<any> {
    return await this.connect.db('user-registered').collection('attempts').updateOne({"email":email},{$set:{
      "otp": otp
    }});
  }

  async match_registered_otp(email:string,otp:number) : Promise<any> {
    return await this.connect.db('user-registered').collection('attempts').findOne({"email":email,"otp": otp});
  }

  async update_credentials(email:string,password:string) : Promise<any> {
    return await this.connect.db('user-registered').collection('credentials').updateOne({"email":email},{$set:{
      "password": password
    }});
  }

  //..............................................................................................................

  async fetch_attempts( email:string ) : Promise<any> {
    return await this.connect.db('user-unregistered').collection('attempts').findOne({"email":email});
  }

  async fetch_details( email:string ) : Promise<any> {
    return await this.connect.db('user-unregistered').collection('details').findOne({"email":email});
  }

  async delete_attempts( email:string ) : Promise<any> {
    return await this.connect.db('user-unregistered').collection('attempts').deleteOne({"email":email});
  }

  async delete_details( email:string ) : Promise<any> {
    return await this.connect.db('user-unregistered').collection('details').deleteOne({"email":email});
  }

  //...........................................................................................................

  async reinsert_attempts( document : Object ) : Promise<any> {
    return await this.connect.db('user-registered').collection('attempts').insertOne(document);
  }

  async reinsert_details( document : Object ) : Promise<any> {
    return await this.connect.db('user-registered').collection('details').insertOne(document);
  }

  async reinsert_credentials( document : Object ) : Promise<any> {
    return await this.connect.db('user-registered').collection('credentials').insertOne(document);
  }

  //............................................................................................................

  //to reset the attempts of unregistered users
  async update_all_unregistered_attempts() :Promise<any> {
    await this.connect.db('user-unregistered').collection('attempts').updateMany({},{$set:{
      "otp-resend":3,
      "otp-verify":3,
    }})
  }

  //to reset the attempts of registered users
  async update_all_registered_attempts() :Promise<any> {
    await this.connect.db('user-registered').collection('attempts').updateMany({},{$set:{
      "otp-resend":3,
      "otp-verify":3,
    }})
  }

  //...........................................................................................................

  async query(query : Object) :Promise<any> {
    return await this.connect.db('user-all').collection('query').insertOne(query);
  }

//.....................................................................................

  async demo_func() :Promise<any>{
    await this.connect.db('new').createCollection('demo');
  }

  async demo_rename() :Promise<any>{
    await this.connect.db('new').renameCollection('demo','myName');
  }

  async demo_remove() :Promise<any>{
    await this.connect.db('new').dropCollection('new');
  }
}
