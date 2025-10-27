export interface User {
  name: any;
  id: number;
  // Add other properties if known (e.g., name: string, email: string)
}
export interface Question {
  id: number;
  institutionId: number;
  frameworkId: number;
  industryId: number;
  questionBankId: number;
  type: string;
  department: string;
  // users: string;
  users: User[];
  scope: string;
  title: string;
  content: string;
  isRequired: number;
  isActive: number;
  amendedAt: any;
  createdAt: string;
  updatedAt: string;
  institution: Institution;
  framework: Framework;
  industry: Industry;
  questionBank: QuestionBank;
  parentId: number | null;
  parentTitle?: string; // Parent question title for hierarchy display
  displayNo: string;
  category: Category;
  answer?: any;
  hasRemarks?: boolean; // Added to match QuestionFormSubmit
  hasAttachment?: boolean; // Added to match QuestionFormSubmit
  status?: QuestionStatus; // Added to support adjustedStatus
  files?: { url: string, name: string }[]; // Added to support file attachments
  ai_suggested_answers?: string[] | undefined;
}

export interface Category {
  id: number;
  name: string;
  updatedAt: string;
  createdAt: string;
}

export type QuestionStatus = 'PENDING' | 'ONGOING' | 'COMPLETED';

export interface Institution {
  id: number;
  name: string;
  updatedAt: string;
  createdAt: string;
}

export interface Framework {
  id: number;
  name: string;
  updatedAt: string;
  createdAt: string;
}

export interface Industry {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionBank {
  id: number;
  name: string;
  draft: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  questions_count: number;
}
