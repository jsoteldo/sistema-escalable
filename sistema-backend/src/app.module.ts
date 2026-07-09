import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Configure database using Mongoose. Connects to standard local mongo or env uri
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/sistema-escalable'),
    AuthModule,
  ],
})
export class AppModule {}
