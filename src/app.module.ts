import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './ai/ai.module';
import { WatsonxModule } from './watsonx/watsonx.module';
import { UtilsModule } from './utils/utils.module.';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AiModule,
    WatsonxModule,
    UtilsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}