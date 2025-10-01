
export enum CustomerStatus {
    New = 'Mới',
    Contacted = 'Đã Liên Hệ',
    Potential = 'Tiềm Năng',
    Closed = 'Đã Chốt',
    Lost = 'Đã Mất',
}

export interface Customer {
    id: number;
    createdAt: string; // ISO date string
    fullName: string;
    phone: string;
    preferredModel: string;
    preferredColor: string;
    reasonNotBuying: string;
    status: CustomerStatus;
}

export interface AiSuggestion {
    analysis: string;
    consultingStrategies: string[];
    promotionIdeas: string[];
}

// Defines the structure for a user, including role for access control.
export interface User {
  id: string;
  email?: string;
  role: 'admin' | 'user';
  app_metadata: { [key: string]: any };
  user_metadata: { [key: string]: any };
  aud: string;
  created_at: string;
}

// Defines the structure for a user session.
export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
  factorId?: string;
}
