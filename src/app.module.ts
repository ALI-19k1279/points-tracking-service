import { Logger, Module } from '@nestjs/common';
import { UserModule } from '@modules/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [],
  providers: [Logger],
})
export class AppModule {}
