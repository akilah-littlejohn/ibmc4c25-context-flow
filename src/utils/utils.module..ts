// src/utils/utils.module.ts
import { Module } from '@nestjs/common';
import { AdvancedMockRagService } from './advanced-mock-rag.service';

@Module({
  providers: [AdvancedMockRagService],
  exports: [AdvancedMockRagService], 
})
export class UtilsModule {}