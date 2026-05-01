import type {
  PersonalTicketCategory,
  PersonalTicketPriority,
  PersonalTicketStatus,
} from './personal-ticket-validation';

export type PersonalTicketRecord = {
  id: string;
  title: string;
  description?: string | null;
  category: PersonalTicketCategory;
  priority: PersonalTicketPriority;
  status: PersonalTicketStatus;
  due_at?: string | null;
  created_by?: string | null;
  created_by_email?: string | null;
  internal_notes?: string | null;
  created_at: string;
  updated_at: string;
  last_activity_at?: string | null;
};

export type PersonalTicketsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};
