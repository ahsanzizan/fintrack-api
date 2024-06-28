import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AuthModule } from './core/auth/auth.module';
import { UserModule } from './core/user/user.module';
import { TransactionModule } from './core/transaction/transaction.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.development'],
    }),
    TransactionModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
