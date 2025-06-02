import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common'; 
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs'; 

export interface ChatMessage { 
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface WatsonxChatParams { 
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stop_sequences?: string[];
  frequency_penalty?: number;
  presence_penalty?: number;
  repetition_penalty?: number;
  seed?: number;
}

interface WatsonxTokenResponse { 
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expiration: number;
  scope: string;
}

interface WatsonxChatResult { 
  model_id: string;
  created_at: string;
  choices: Array<{
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
    index?: number;
  }>;
  id?: string;
  object?: string;
  created?: number;
  usage?: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
  system?: any;
}

@Injectable() 
export class WatsonxClient {
  
  private readonly logger = new Logger(WatsonxClient.name);
  private iamToken: string | null = null;
  private tokenExpiryTime: number | null = null;

  private readonly watsonApiKey: string;
  private readonly watsonProjectId: string;
  private readonly watsonModelId: string;
  private readonly watsonEndpoint: string;
  private readonly iamEndpoint = 'https://iam.cloud.ibm.com/identity/token';


  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService, 
  ) {
    this.watsonApiKey = this.configService.get<string>('WATSON_API_KEY') ?? '';
    this.watsonProjectId = this.configService.get<string>('WATSON_PROJECT_ID') ?? '';
    this.watsonModelId = this.configService.get<string>('WATSON_MODEL_ID') ?? '';
    this.watsonEndpoint = this.configService.get<string>('WATSON_ENDPOINT') ?? '';

    if (!this.watsonApiKey || !this.watsonProjectId || !this.watsonModelId || !this.watsonEndpoint) {
      this.logger.error('Watsonx API Key, Project ID, Model ID, or Endpoint is not configured in .env file.');
      throw new Error('Watsonx configuration missing.');
    }
  }

  private async getIamToken(): Promise<string> {
    if (this.iamToken && this.tokenExpiryTime && Date.now() < this.tokenExpiryTime) {
      this.logger.debug('Using cached IAM token.');
      return this.iamToken;
    }

    this.logger.log('Fetching new IAM token...');
    const params = new URLSearchParams();
    params.append('grant_type', 'urn:ibm:params:oauth:grant-type:apikey');
    params.append('apikey', this.watsonApiKey);

    try {
      const response = await firstValueFrom( 
        this.httpService.post<WatsonxTokenResponse>( 
          this.iamEndpoint,
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
            },
          },
        ),
      );

      this.iamToken = response.data.access_token;
      this.tokenExpiryTime = Date.now() + (response.data.expires_in - 300) * 1000;
      this.logger.log('Successfully fetched new IAM token.'); 
      return this.iamToken;
    } catch (error) {
      this.logger.error('Failed to fetch IAM token:', error.response?.data || error.message);
      throw new HttpException('Failed to authenticate with IBM Cloud IAM', HttpStatus.INTERNAL_SERVER_ERROR); 
    }
  }

  async generateChatCompletion(
    messages: ChatMessage[], 
    params?: WatsonxChatParams, 
  ): Promise<string> {
    const token = await this.getIamToken(); 
    const apiUrl = `${this.watsonEndpoint}/ml/v1/text/chat?version=2023-05-29`; 

    const payload = {
      messages: messages,
      model_id: this.watsonModelId, 
      project_id: this.watsonProjectId, 
      temperature: params?.temperature ?? 0.1,
      max_tokens: params?.max_tokens ?? 2000,
      top_p: params?.top_p ?? 1.0,
      stop_sequences: params?.stop_sequences ?? [],
    };

    this.logger.debug(`Sending request to Watsonx Chat API: ${apiUrl} with model ${this.watsonModelId}`);
    this.logger.verbose(`Request payload: ${JSON.stringify(payload, null, 2)}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post<WatsonxChatResult>(apiUrl, payload, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 90000,
        }),
      );

      if (response.data.choices && response.data.choices.length > 0 && response.data.choices[0].message) {
        this.logger.log(`Successfully received response from Watsonx Chat API for model ${this.watsonModelId}`);
        return response.data.choices[0].message.content;
      } else {
        this.logger.warn('Watsonx Chat API response did not contain expected choices[0].message structure.', response.data);
        throw new Error('Invalid response structure from Watsonx Chat API (choices missing)');
      }
    } catch (error) {
      const errorDetails = error.response?.data || error.message;
      this.logger.error(`Error calling Watsonx Chat API: ${JSON.stringify(errorDetails)}`);
      if (error.response?.status) {
        throw new HttpException(errorDetails, error.response.status);
      }
      throw new HttpException('Failed to generate chat completion with Watsonx', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}