import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { AdvancedMockRagService, RagDocument } from '../utils/advanced-mock-rag.service';
import { PromptBuilderService } from '../prompts/prompt-builder.service';
import { WatsonxClient, ChatMessage } from '../watsonx/watsonx.client'; 
import {
  ParsedEmailResponse,
  EmailIntent,
  UnknownIntentSchema,
} from '../prompts/intent-schemas';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly ragService: AdvancedMockRagService,
    private readonly promptBuilder: PromptBuilderService,
    private readonly watsonxClient: WatsonxClient,
  ) {}

  async parseEmail(emailContent: string): Promise<ParsedEmailResponse> {
    this.logger.log(`Starting email parsing for: "${emailContent.substring(0, 50)}..."`);

    const ragContext: RagDocument[] = this.ragService.findContext(emailContent);
    if (ragContext.length > 0) {
      this.logger.log(`Found ${ragContext.length} relevant RAG document(s). Top match: ${ragContext[0].customerName}`);
    } else {
      this.logger.log('No specific RAG context found for the email.');
    }

    
    const messages: ChatMessage[] = this.promptBuilder.buildChatMessages(
      emailContent,
      ragContext,
    );

    let llmResponseString: string;
    try {
      this.logger.log('Sending messages to Watsonx.ai Chat API...');
      llmResponseString = await this.watsonxClient.generateChatCompletion(messages, {

      });
      this.logger.log('Received response from Watsonx.ai Chat API.');
      this.logger.debug(`LLM Raw Response String: ${llmResponseString}`);
    } catch (error) {
      this.logger.error('Error calling Watsonx.ai Chat service', error.stack);
      throw new HttpException('Failed to get response from AI model', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    
    let jsonToParse = llmResponseString;
    const markdownJsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const plainMarkdownRegex = /```\s*([\s\S]*?)\s*```/;
    
    let match = jsonToParse.match(markdownJsonRegex);
    if (match && match[1]) {
      this.logger.log('JSON extracted from ```json markdown code block.');
      jsonToParse = match[1];
    } else {
      match = jsonToParse.match(plainMarkdownRegex);
      if (match && match[1]) {
        this.logger.log('JSON extracted from plain ``` markdown code block.');
        jsonToParse = match[1];
      } else {
        this.logger.log('No markdown code block detected in LLM response, attempting to parse as is.');
      }
    }
    jsonToParse = jsonToParse.trim();

    try {
      const parsedOutput: ParsedEmailResponse = JSON.parse(jsonToParse);
      this.logger.log(`Successfully parsed LLM JSON response. Intent: ${parsedOutput.intent}`);

      if (!parsedOutput.intent || !Object.values(EmailIntent).includes(parsedOutput.intent)) {
         this.logger.warn('LLM response has missing or invalid intent. Defaulting to UNKNOWN.', parsedOutput);
         return {
            intent: EmailIntent.UNKNOWN,
            customer_id: parsedOutput.customer_id || (ragContext.length > 0 ? ragContext[0].customerId : undefined),
            reason_for_unknown: "LLM response had invalid or missing intent field.",
            automation_tasks: [{ action: "manual_review_required", priority: "high" }]
         } as UnknownIntentSchema;
      }

      if (ragContext.length > 0 && !parsedOutput.customer_id) {
          parsedOutput.customer_id = ragContext[0].customerId;
      }

      return parsedOutput;
    } catch (error) {
      this.logger.error('Failed to parse JSON response from LLM.', error.stack);
      this.logger.error(`Cleaned LLM output that failed to parse: ${jsonToParse}`);
      
      const fallbackResponse: UnknownIntentSchema = {
        intent: EmailIntent.UNKNOWN,
        customer_id: ragContext.length > 0 ? ragContext[0].customerId : undefined,
        reason_for_unknown: 'AI model output was not valid JSON or did not match expected structure.',
        automation_tasks: [{ action: 'manual_review_required', priority: 'high', details: { error: 'Invalid JSON from LLM' } }],
      };
      return fallbackResponse;
    }
  }
}