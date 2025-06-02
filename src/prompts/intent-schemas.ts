
export enum EmailIntent {
  BILLING_DISPUTE = 'billing_dispute',
  TECH_SUPPORT = 'tech_support',
  SALES_INQUIRY = 'sales_inquiry',
  UNKNOWN = 'unknown',
}

interface BaseResponseSchema {
  intent: EmailIntent;
  customer_id?: string; 
}

export interface BillingDisputeSchema extends BaseResponseSchema {
  intent: EmailIntent.BILLING_DISPUTE;
  dispute_type: 'overcharge' | 'unrecognized_charge' | 'service_not_rendered' | 'other';
  amount_disputed?: number; 
  invoice_number?: string;
  desired_resolution?: string; 
  automation_tasks: Array<{ action: string; priority: 'high' | 'medium' | 'low'; details?: Record<string, any> }>;
}

export interface TechSupportSchema extends BaseResponseSchema {
  intent: EmailIntent.TECH_SUPPORT;
  product_or_service: string; 
  issue_description: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  troubleshooting_steps_taken?: string;
  automation_tasks: Array<{ action: string; priority: 'high' | 'medium' | 'low'; details?: Record<string, any> }>;
}

export interface SalesInquirySchema extends BaseResponseSchema {
  intent: EmailIntent.SALES_INQUIRY;
  product_of_interest?: string;
  inquiry_type: 'feature_request' | 'pricing' | 'demo_request' | 'custom_solution' | 'other';
  company_size?: number;
  potential_value?: string; 
  automation_tasks: Array<{ action: string; priority: 'high' | 'medium' | 'low'; details?: Record<string, any> }>;
}

export interface UnknownIntentSchema extends BaseResponseSchema {
  intent: EmailIntent.UNKNOWN;
  reason_for_unknown?: string; 
  automation_tasks: Array<{ action: string; priority: 'high' | 'medium' | 'low'; details?: Record<string, any> }>;
}

export type ParsedEmailResponse =
  | BillingDisputeSchema
  | TechSupportSchema
  | SalesInquirySchema
  | UnknownIntentSchema;

export function getSchemaString(intent: EmailIntent): string {
  const exampleAny = "any relevant value";
  const exampleString = "example string";
  const exampleNumber = 100;
  const exampleAutomationTask = `{ action: "example_action", priority: "medium" }`;

  const schemas: Record<EmailIntent, object> = {
    [EmailIntent.BILLING_DISPUTE]: {
      intent: EmailIntent.BILLING_DISPUTE,
      customer_id: "C-XXXX (if identified)",
      summary: "Brief summary of the billing dispute.",
      dispute_type: "overcharge | unrecognized_charge | service_not_rendered | other",
      amount_disputed: `Number (e.g., ${exampleNumber}) (optional)`,
      invoice_number: `String (e.g., INV-12345) (optional)`,
      desired_resolution: `String (e.g., refund, correction) (optional)`,
      automation_tasks: `[${exampleAutomationTask}, ...]`,
    },
    [EmailIntent.TECH_SUPPORT]: {
      intent: EmailIntent.TECH_SUPPORT,
      customer_id: "C-XXXX (if identified)",
      summary: "Brief summary of the technical issue.",
      product_or_service: `String (e.g., App X, Website Login)`,
      issue_description: "Detailed description of the problem.",
      urgency: "critical | high | medium | low",
      troubleshooting_steps_taken: `String (e.g., Restarted device, cleared cache) (optional)`,
      automation_tasks: `[${exampleAutomationTask}, ...]`,
    },
    [EmailIntent.SALES_INQUIRY]: {
      intent: EmailIntent.SALES_INQUIRY,
      customer_id: "C-XXXX (if identified)",
      summary: "Brief summary of the sales inquiry.",
      product_of_interest: `String (e.g., Product Y, Service Z) (optional)`,
      inquiry_type: "feature_request | pricing | demo_request | custom_solution | other",
      company_size: `Number (optional)`,
      potential_value: `String (e.g., 10k-50k, Undetermined) (optional)`,
      automation_tasks: `[${exampleAutomationTask}, ...]`,
    },
    [EmailIntent.UNKNOWN]: {
        intent: EmailIntent.UNKNOWN,
        customer_id: "C-XXXX (if identified, but may not be relevant)",
        summary: "Summary of why the email intent is unclear or could not be determined.",
        reason_for_unknown: "e.g., Email content too vague, Multiple conflicting intents",
        automation_tasks: `[{ action: "manual_review_required", priority: "high" }]`,
    }
  };
  return JSON.stringify(schemas[intent] || schemas[EmailIntent.UNKNOWN], null, 2);
}