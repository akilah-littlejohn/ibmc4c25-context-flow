import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { UtilsModule } from '../utils/utils.module.'; 
import { WatsonxModule } from '../watsonx/watsonx.module'; 
import { PromptBuilderService } from '../prompts/prompt-builder.service'; 
@Module({
  imports: [
    UtilsModule,    
    WatsonxModule,  
  ],
  controllers: [AiController],
  providers: [
    AiService,
    PromptBuilderService, 
  ],
})
export class AiModule {}
