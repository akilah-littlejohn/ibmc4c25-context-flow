// src/utils/advanced-mock-rag.service.ts
import { Injectable } from '@nestjs/common';
import { MockCustomer, mockCustomers } from '../mock/mock-customers';

export interface RagDocument {
  customerId: string;
  customerName: string;
  customerEmail: string;
  documentSource: string; 
  retrievedContext: Record<string, any>;
  score: number; 
}

@Injectable()
export class AdvancedMockRagService {
  private readonly customers: MockCustomer[] = mockCustomers;

  constructor() {}

  
  findContext(emailContent: string): RagDocument[] {
    const foundDocuments: RagDocument[] = [];
    const emailLowerCase = emailContent.toLowerCase();

    this.customers.forEach(customer => {
      let matchScore = 0;
      const matchedKeywords: string[] = [];

      customer.keywords.forEach(keyword => {
        if (emailLowerCase.includes(keyword.toLowerCase())) {
          matchScore++;
          matchedKeywords.push(keyword);
        }
      });

      
      if (matchScore > 0) {
        foundDocuments.push({
          customerId: customer.id,
          customerName: customer.name,
          customerEmail: customer.emailAddress,
          documentSource: 'MockCustomerDB',
          retrievedContext: {
            ...customer.metadata,
            matchedKeywords: matchedKeywords, 
          },
          score: matchScore, 
        });
      }
    });

    return foundDocuments.sort((a, b) => b.score - a.score);
  }
}