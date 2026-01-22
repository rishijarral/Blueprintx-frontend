/**
 * Domain models matching backend DTOs
 * These types mirror the Rust API response structures
 */

import type {
  ProjectStatus,
  TenderStatus,
  BidStatus,
  TaskStatus,
  RFIStatus,
  DocumentStatus,
  DocumentType,
  Priority,
  UserType,
} from "@/lib/constants/statuses";

// ============================================
// User & Profile
// ============================================

export interface Profile {
  id: string;
  email: string;
  user_type: UserType;
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  title: string | null;
  bio: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  user_id: string;
  notification_settings: NotificationSettings;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  email_new_bid: boolean;
  email_bid_status: boolean;
  email_new_tender: boolean;
  email_rfi_update: boolean;
  email_task_assigned: boolean;
  push_enabled: boolean;
}

// ============================================
// Projects
// ============================================

export interface Project {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  status: ProjectStatus;
  estimated_value: number | null;
  bid_due_date: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  status?: ProjectStatus;
  estimated_value?: number;
  bid_due_date?: string;
  start_date?: string;
  end_date?: string;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {}

// ============================================
// Documents
// ============================================

export interface Document {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  document_type: DocumentType;
  file_path: string | null;
  file_size: number | null;
  mime_type: string | null;
  version: number;
  status: DocumentStatus;
  category: string | null;
  revised: string | null;
  author: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentInput {
  name: string;
  description?: string;
  document_type: DocumentType;
  category?: string;
  author?: string;
}

// ============================================
// Tenders
// ============================================

export interface Tender {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  trade_category: string | null;
  scope_of_work: string | null;
  status: TenderStatus;
  bid_due_date: string | null;
  estimated_value: number | null;
  awarded_to: string | null;
  priority: Priority | null;
  created_at: string;
  updated_at: string;
  // Populated fields
  project?: Project;
  bid_count?: number;
}

export interface CreateTenderInput {
  name: string;
  description?: string;
  trade_category?: string;
  scope_of_work?: string;
  status?: TenderStatus;
  bid_due_date?: string;
  estimated_value?: number;
  priority?: Priority;
}

export interface UpdateTenderInput extends Partial<CreateTenderInput> {
  awarded_to?: string;
}

// ============================================
// Bids
// ============================================

export interface Bid {
  id: string;
  tender_id: string;
  bidder_id: string | null;
  company_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  bid_amount: number;
  status: BidStatus;
  notes: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  // Populated fields
  tender?: Tender;
}

export interface CreateBidInput {
  company_name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  bid_amount: number;
  notes?: string;
}

export interface UpdateBidInput extends Partial<CreateBidInput> {
  status?: BidStatus;
}

// ============================================
// Tasks
// ============================================

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  assignee: string | null;
  assignee_id: string | null;
  due_date: string | null;
  category: string | null;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  assignee?: string;
  assignee_id?: string;
  due_date?: string;
  category?: string;
  progress?: number;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {}

// ============================================
// RFIs
// ============================================

export interface RFI {
  id: string;
  project_id: string;
  number: number;
  title: string;
  description: string | null;
  status: RFIStatus;
  priority: Priority | null;
  requester: string | null;
  requester_id: string | null;
  assignee: string | null;
  assignee_id: string | null;
  category: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  // Populated fields
  responses?: RFIResponse[];
}

export interface RFIResponse {
  id: string;
  rfi_id: string;
  content: string;
  author: string | null;
  author_id: string;
  created_at: string;
}

export interface CreateRFIInput {
  title: string;
  description?: string;
  priority?: Priority;
  requester?: string;
  assignee?: string;
  assignee_id?: string;
  category?: string;
  due_date?: string;
}

export interface UpdateRFIInput extends Partial<CreateRFIInput> {
  status?: RFIStatus;
}

export interface CreateRFIResponseInput {
  content: string;
  author?: string;
}

// ============================================
// Subcontractors
// ============================================

export interface Subcontractor {
  id: string;
  profile_id: string | null;
  name: string;
  trade: string;
  rating: number | null;
  review_count: number;
  location: string | null;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  projects_completed: number;
  average_bid_value: number | null;
  response_time: string | null;
  verified: boolean;
  specialties: string[];
  recent_projects: RecentProject[] | null;
  created_at: string;
}

export interface RecentProject {
  name: string;
  value?: number;
  completed_date?: string;
}

// ============================================
// AI Features
// ============================================

export interface PlanSummary {
  building_type: string;
  square_footage: number | null;
  floors: number | null;
  description: string;
  key_features: string[];
  materials: string[];
  special_requirements: string[];
}

export interface TradeScope {
  trade: string;
  scope_items: string[];
  estimated_hours: number | null;
  complexity: "low" | "medium" | "high";
  notes: string | null;
}

export interface QnAResponse {
  answer: string;
  sources: QnASource[];
  confidence: number;
}

export interface QnASource {
  document_id: string;
  document_name: string;
  page_number: number | null;
  excerpt: string;
}

export interface StandardTrade {
  code: string;
  name: string;
  category: string;
}
