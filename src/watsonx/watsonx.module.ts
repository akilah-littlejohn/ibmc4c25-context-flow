// src/watsonx/watsonx.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config'; 
import { WatsonxClient } from './watsonx.client';

@Module({
  imports: [
    HttpModule, 
    ConfigModule, 
  ],
  providers: [WatsonxClient],
  exports: [WatsonxClient], 
})
export class WatsonxModule {}