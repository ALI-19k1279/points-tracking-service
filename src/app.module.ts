import { Logger, Module } from '@nestjs/common';
import { UserModule } from '@modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import appConfig from '@config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['.env'],
    }),
    UserModule,
  ],
  controllers: [],
  providers: [Logger],
})
export class AppModule {}
