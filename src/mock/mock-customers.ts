// src/mock/mock-customers.ts

export interface MockCustomer {
  id: string;
  name: string;
  emailAddress: string;
  metadata: {
    joinDate: string;
    plan?: string; 
    totalSpent?: number;
    lastInteraction?: string;
    openTickets?: number;
  };
 
  keywords: string[];
}

export const mockCustomers: MockCustomer[] = [
  {
    id: 'C-1001',
    name: 'Sarah Chen',
    emailAddress: 'sarah.chen@example.com',
    metadata: {
      joinDate: '2023-01-15',
      plan: 'Premium',
      totalSpent: 1250,
      lastInteraction: '2024-05-10',
      openTickets: 1,
    },
    keywords: [
      'sarah chen',
      'invoice SC-2024-003',
      'premium plan upgrade',
      'C-1001',
      'subscription query',
    ],
  },
  {
    id: 'C-2088',
    name: 'Mike Rodriguez',
    emailAddress: 'mike.rodriguez@example.com',
    metadata: {
      joinDate: '2022-11-05',
      plan: 'Basic',
      totalSpent: 350,
      lastInteraction: '2024-04-20',
      openTickets: 0,
    },
    keywords: [
      'mike rodriguez',
      'order MR-2023-789',
      'login issue',
      'C-2088',
      'password reset',
      'technical assistance',
    ],
  },
  {
    id: 'C-3021',
    name: 'Jennifer Park',
    emailAddress: 'jennifer.park@example.com',
    metadata: {
      joinDate: '2023-07-30',
      plan: 'Enterprise Trial',
      totalSpent: 0,
      lastInteraction: '2024-05-25',
      openTickets: 2,
    },
    keywords: [
      'jennifer park',
      'quote QP-2024-015',
      'enterprise features',
      'C-3021',
      'sales inquiry',
      'product demo',
      'trial extension',
    ],
  },
];