import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { SeederService } from './seeder/seeder.service';
import { UserSchema, UserSchemaName } from './schemas/user.schema';
import { Role, RoleSchema } from './schemas/role.schema';

@Module({
  imports: [
    // Configure database using Mongoose. Connects to standard local mongo or env uri
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/sistema-escalable'),
    MongooseModule.forFeature([
      { name: UserSchemaName, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
    AuthModule,
    UsuariosModule,
  ],
  providers: [SeederService],
})
export class AppModule {}
