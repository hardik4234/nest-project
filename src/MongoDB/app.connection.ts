import { Module } from '@nestjs/common';
import { MongoClient} from 'mongodb';

@Module({
  providers: [{
      provide: 'DATABASE_CONNECTION',
      useFactory: async (): Promise<any> => {
        try {
          return await MongoClient.connect(process.env.MONGODB_URI,{});
        }catch (e){
          throw e;
        }
      }
    },
  ],
  exports: ['DATABASE_CONNECTION'],})

export class DatabaseConnector {}