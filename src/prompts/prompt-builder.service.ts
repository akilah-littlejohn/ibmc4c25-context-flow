import { Injectable } from '@nestjs/common';
import { RagDocument } from '../utils/advanced-mock-rag.service';
import { EmailIntent, getSchemaString } from './intent-schemas';
import { ChatMessage } from '../watsonx/watsonx.client';

@Injectable()
export class PromptBuilderService {
  constructor() {}

  buildChatMessages(
    emailContent: string,
    ragContext: RagDocument[] | null,
    targetIntent?: EmailIntent, 
  ): ChatMessage[] {
    const identifiedCustomer = ragContext && ragContext.length > 0 ? ragContext[0] : null;
    const contextString = identifiedCustomer
      ? `Relevant Customer Context (from RAG system):
Name: ${identifiedCustomer.customerName}
Customer ID: ${identifiedCustomer.customerId}
Email: ${identifiedCustomer.customerEmail}
Details: ${JSON.stringify(identifiedCustomer.retrievedContext, null, 2)}`
      : 'No specific customer context found by RAG system.';

    let intentInstruction: string;
    let schemaForPrompt: string;

    if (targetIntent && targetIntent !== EmailIntent.UNKNOWN) {
      intentInstruction = `The primary intent of this email is likely: ${targetIntent}. Please use the following JSON schema for this intent.`;
      schemaForPrompt = getSchemaString(targetIntent);
    } else {
      intentInstruction = `First, determine the most appropriate intent for the email from the following options: ${Object.values(EmailIntent).join(', ')}.
Then, populate the corresponding JSON schema. If no specific intent can be determined with high confidence, use the '${EmailIntent.UNKNOWN}' intent and schema.`;

      const allSchemaExamples = Object.values(EmailIntent)
        .filter(intent => intent !== EmailIntent.UNKNOWN)
        .map(intent => `For intent '${intent}':\n${getSchemaString(intent)}`)
        .join('\n\n');
      
      schemaForPrompt = `Possible JSON output schemas:
${allSchemaExamples}

Schema for '${EmailIntent.UNKNOWN}' (use if no other intent fits well):
${getSchemaString(EmailIntent.UNKNOWN)}`;
    }

    const systemMessageContent = `You are an AI assistant specializing in customer support email analysis. Your task is to meticulously analyze the provided email content and any supplementary customer context.
You must extract structured information and respond ONLY with a valid JSON object that adheres to the provided JSON schema corresponding to the email's determined intent.
Do NOT include any other text, explanations, apologies, or markdown formatting (like \`\`\`json) around the JSON output.
The 'summary' field in the JSON should be a concise summary of the email's main points.
The 'customer_id' field should be populated if a customer was identified from the RAG context or can be clearly inferred from the email.
The 'automation_tasks' array should suggest relevant next steps based on the intent and content. Examples:
- Billing Dispute: [{ "action": "assign_to_billing", "priority": "high", "details": { "invoice_id": "INV-123" } }]
- Tech Support: [{ "action": "create_support_ticket", "priority": "medium", "details": { "product": "App X" } }]
- Sales Inquiry: [{ "action": "notify_sales_team", "priority": "medium", "details": { "interest": "Product Y" } }]
- Unknown: [{ "action": "manual_review_required", "priority": "high" }]`;

    const userMessageContent = `
**Customer Email Content:**
---
${emailContent}
---

**Retrieved Context (if any):**
---
${contextString}
---

**Instructions & JSON Schema:**
1. Read the email content and any retrieved customer context carefully.
2. ${intentInstruction}
3. Ensure all fields in the chosen JSON schema are addressed. If information for a field is not present in the email, use a sensible default (e.g., null for optional fields, or a specific string like "not specified" only if the schema indicates string type for that scenario) or omit optional fields if appropriate based on the schema description. Strive for accuracy.

**JSON Schema to use:**
---
${schemaForPrompt}
---

Please provide your analysis as a single, raw JSON object:
`;

    return [
      {
        role: 'system',
        content: systemMessageContent,
      },
      {
        role: 'user',
        content: userMessageContent,
      },
    ];
  }
}