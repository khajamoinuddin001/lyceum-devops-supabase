
export interface Lesson {
  id: string;
  title: string;
  duration: number; // in minutes
  type: 'video' | 'text' | 'quiz';
  content: string;
  videoUrl?: string;
  completed: boolean;
  questions?: Question[]; // For quiz type
}

export interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number; // index of the correct option
}

export interface Module {
  id:string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title:string;
  instructor: string;
  description: string;
  thumbnail: string;
  modules: Module[];
  enrolled: boolean;
  completionDate?: string;
}

export type ContactStatus = 'Active Student' | 'Prospect' | 'Past Student';

export interface Note {
    id: string;
    text: string;
    date: string;
}

export interface Document {
    id: string;
    name: string;
    size: string;
    uploadDate: string;
    url: string; // This would link to the stored file
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  avatar: string;
  company: string;
  phone: string;
  status: ContactStatus;
  enrolledCourses: string[]; // array of course IDs
  notes: Note[];
  documents: Document[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export type CrmStage = 'New' | 'Qualified' | 'Proposal' | 'Won' | 'Lost';

export interface CrmDeal {
  id: string;
  name: string;
  contactId: string;
  stage: CrmStage;
  value: number;
  // Extended fields
  probability?: number;
  expectedClosingDate?: string;
  salesperson?: string;
  assignedTo?: string;
  coachingInterest?: string;
  countryInterest?: string;
  visaType?: string;
  tags?: string[];
  notes?: string;
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';

export interface Invoice {
    id: string;
    invoiceNumber: string;
    contactId: string;
    amount: number;
    status: InvoiceStatus;
    issueDate: string;
    dueDate: string;
}

export type UserRole = 'admin' | 'staff' | 'student';
