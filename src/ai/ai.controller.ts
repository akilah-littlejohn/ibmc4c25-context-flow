import { Controller, Post, Body, ValidationPipe, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { ParseEmailDto } from '../dto/parse-email.dto';
import { ParsedEmailResponse } from '../prompts/intent-schemas';

@Controller('ai') 
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  @Post('parse-email')
  @HttpCode(HttpStatus.OK) 
  async parseEmail(
    @Body(new ValidationPipe({ transform: true })) parseEmailDto: ParseEmailDto,
  ): Promise<ParsedEmailResponse> {
    this.logger.log(`Received request for /ai/parse-email`);
    return this.aiService.parseEmail(parseEmailDto.email);
  }
}