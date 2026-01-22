/**
 * Domain models matching backend DTOs exactly
 * These types mirror the Rust API response structures
 * All field names use snake_case to match backend
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
  is_admin: boolean;
  updated_at: string;
}

export interface UserSettings {
  user_id: string;
  notification_settings: NotificationSettings;
  updated_at: string;
}

/**
 * Notification settings - matches backend field names exactly
 */
export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  bid_updates: boolean;
  rfi_alerts: boolean;
  task_reminders: boolean;
  weekly_reports: boolean;
}

// ============================================
// Projects
// ============================================

export interface Project {
  id: string;
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
  file_size: number;
  mime_type: string;
  version: number;
  status: DocumentStatus;
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
  bids_received: number;
  bids_invited: number;
  awarded_to: string | null;
  priority: Priority | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTenderInput {
  name: string;
  description?: string;
  trade_category?: string;
  scope_of_work?: string;
  bid_due_date?: string;
  estimated_value?: number;
  priority?: Priority;
}

export interface UpdateTenderInput extends Partial<CreateTenderInput> {
  status?: TenderStatus;
  awarded_to?: string;
  priority?: Priority;
}

// ============================================
// Bids
// ============================================

export interface Bid {
  id: string;
  tender_id: string;
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
  // Populated fields from backend joins
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
  progress: number | null;
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

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  progress?: number;
}

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
  priority: Priority;
  requester: string;
  requester_id: string;
  assignee: string;
  assignee_id: string | null;
  category: string | null;
  due_date: string | null;
  responses_count: number;
  attachments_count: number;
  created_at: string;
  updated_at: string;
}

export interface RFIResponse {
  id: string;
  rfi_id: string;
  content: string;
  author: string;
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
}

// ============================================
// Subcontractors
// ============================================

export interface Subcontractor {
  id: string;
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
  recent_projects: RecentProject[];
  created_at: string;
}

export interface RecentProject {
  name: string;
  value: number;
  completed: string;
}

// ============================================
// AI Features
// ============================================

export interface PlanSummary {
  building_type: string;
  project_name: string | null;
  floors: number | null;
  total_area_sqft: number | null;
  key_materials: string[];
  major_systems: string[];
  structural_system: string | null;
  risks: string[];
  assumptions: string[];
  confidence: number;
}

export interface TradeScope {
  trade: string;
  csi_division: string;
  inclusions: string[];
  exclusions: string[];
  required_sheets: string[];
  spec_sections: string[];
  rfi_needed: string[];
  assumptions: string[];
}

export interface TradeScopesResponse {
  project_id: string;
  trades: TradeScope[];
  general_notes: string[];
  confidence: number;
}

export interface TenderScopeDocument {
  trade: string;
  overview: string;
  inclusions: string[];
  exclusions: string[];
  allowances: string[];
  alternates: string[];
  submittals: string[];
  schedule_notes: string[];
  lead_times: string[];
  bid_instructions: string[];
  rfi_questions: string[];
  markdown: string;
}

export interface QnAResponse {
  project_id: string;
  question: string;
  answer: string;
  citations: string[];
  confidence: number;
  followups: string[];
}

export interface StandardTrade {
  code: string;
  name: string;
  category: string;
}

// ============================================
// Processing Jobs
// ============================================

export type JobStatus = "queued" | "running" | "paused" | "completed" | "failed" | "cancelled";
export type StepStatus = "pending" | "running" | "completed" | "failed" | "skipped";

export interface ProcessingStep {
  id: string;
  step_name: string;
  step_key: string;
  step_order: number;
  status: StepStatus;
  progress: number;
  message: string | null;
  details: Record<string, unknown>;
  items_total: number;
  items_processed: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface ProcessingJob {
  id: string;
  document_id: string;
  project_id: string;
  status: JobStatus;
  current_step: string | null;
  progress: number;
  total_steps: number;
  completed_steps: number;
  error_message: string | null;
  error_step: string | null;
  can_retry: boolean;
  retry_count: number;
  steps: ProcessingStep[];
  paused_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export type JobControlAction = 
  | { type: "pause" }
  | { type: "resume" }
  | { type: "cancel" }
  | { type: "retry_step"; step_key: string }
  | { type: "retry_job" };

// SSE Event types
export type JobProgressEvent = 
  | { type: "job_status_changed"; job_id: string; status: string; progress: number; current_step: string | null }
  | { type: "step_started"; job_id: string; step_key: string; step_name: string; step_order: number }
  | { type: "step_progress"; job_id: string; step_key: string; progress: number; items_processed: number; items_total: number; message: string | null }
  | { type: "step_completed"; job_id: string; step_key: string; duration_ms: number }
  | { type: "step_failed"; job_id: string; step_key: string; error: string; can_retry: boolean }
  | { type: "job_completed"; job_id: string; duration_ms: number }
  | { type: "job_failed"; job_id: string; error: string; failed_step: string | null; can_retry: boolean }
  | { type: "job_paused"; job_id: string; current_step: string | null }
  | { type: "job_resumed"; job_id: string }
  | { type: "job_cancelled"; job_id: string }
  | { type: "heartbeat"; timestamp: string };

// ============================================
// Extraction Data
// ============================================

export interface RoomFinishes {
  floor: string | null;
  walls: string | null;
  ceiling: string | null;
  base: string | null;
  paint_color: string | null;
}

export interface ExtractedMaterial {
  id: string;
  project_id: string;
  document_id: string | null;
  name: string;
  description: string | null;
  quantity: number | null;
  unit: string | null;
  unit_cost: number | null;
  total_cost: number | null;
  location: string | null;
  room: string | null;
  specification: string | null;
  trade_category: string | null;
  csi_division: string | null;
  source_page: number | null;
  confidence: number;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExtractedRoom {
  id: string;
  project_id: string;
  document_id: string | null;
  room_name: string;
  room_number: string | null;
  room_type: string | null;
  floor: string | null;
  area_sqft: number | null;
  ceiling_height: number | null;
  perimeter_ft: number | null;
  finishes: RoomFinishes;
  fixtures: string[];
  notes: string | null;
  source_page: number | null;
  confidence: number;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export type MilestoneStatus = "pending" | "in_progress" | "completed" | "delayed" | "cancelled";

export interface ProjectMilestone {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  phase: string | null;
  phase_order: number;
  estimated_duration_days: number | null;
  estimated_start_date: string | null;
  estimated_end_date: string | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  dependencies: string[];
  trades_involved: string[];
  deliverables: string[];
  status: MilestoneStatus;
  progress: number;
  is_ai_generated: boolean;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScopeItem {
  item: string;
  details: string | null;
}

export interface ExtractedTradeScope {
  id: string;
  project_id: string;
  document_id: string | null;
  trade: string;
  trade_display_name: string | null;
  csi_division: string | null;
  inclusions: ScopeItem[];
  exclusions: ScopeItem[];
  required_sheets: string[];
  spec_sections: string[];
  rfi_needed: string[];
  assumptions: string[];
  estimated_value: number | null;
  confidence: number;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExtractionSummary {
  project_id: string;
  materials_count: number;
  rooms_count: number;
  milestones_count: number;
  trade_scopes_count: number;
  verified_materials: number;
  verified_rooms: number;
  verified_milestones: number;
  verified_trade_scopes: number;
  last_extraction_at: string | null;
  processing_job_id: string | null;
  processing_status: string | null;
}

// Input types for extraction data
export interface MaterialInput {
  name: string;
  description?: string;
  quantity?: number;
  unit?: string;
  unit_cost?: number;
  location?: string;
  room?: string;
  specification?: string;
  trade_category?: string;
  csi_division?: string;
  source_page?: number;
}

export interface RoomInput {
  room_name: string;
  room_number?: string;
  room_type?: string;
  floor?: string;
  area_sqft?: number;
  ceiling_height?: number;
  perimeter_ft?: number;
  finishes?: RoomFinishes;
  fixtures?: string[];
  notes?: string;
  source_page?: number;
}

export interface MilestoneInput {
  name: string;
  description?: string;
  phase?: string;
  phase_order?: number;
  estimated_duration_days?: number;
  estimated_start_date?: string;
  estimated_end_date?: string;
  dependencies?: string[];
  trades_involved?: string[];
  deliverables?: string[];
  status?: MilestoneStatus;
  progress?: number;
}

export interface TradeScopeInput {
  trade: string;
  trade_display_name?: string;
  csi_division?: string;
  inclusions?: ScopeItem[];
  exclusions?: ScopeItem[];
  required_sheets?: string[];
  spec_sections?: string[];
  rfi_needed?: string[];
  assumptions?: string[];
  estimated_value?: number;
}

// ============================================
// Hiring & Marketplace
// ============================================

export type HireRequestStatus = 
  | "draft" | "pending" | "sent" | "viewed" | "interested" | "negotiating"
  | "contract_sent" | "contract_signed" | "hired" | "declined" | "cancelled" | "expired";

export type RateType = "fixed" | "hourly" | "daily" | "weekly" | "per_unit" | "negotiable";

export type ContractStatus = 
  | "draft" | "pending_gc" | "pending_sub" | "gc_signed" | "fully_signed"
  | "active" | "completed" | "terminated" | "disputed";

export type TeamMemberStatus = "pending" | "active" | "on_hold" | "completed" | "terminated";

export interface ExternalSubcontractor {
  id: string;
  added_by: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  trade: string;
  secondary_trades: string[];
  location: string | null;
  address: string | null;
  license_number: string | null;
  insurance_info: string | null;
  notes: string | null;
  rating: number;
  projects_together: number;
  is_preferred: boolean;
  created_at: string;
  updated_at: string;
}

export interface HireRequestSubcontractor {
  id: string;
  is_external: boolean;
  company_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  trade: string;
  location: string | null;
  rating: number | null;
  verified: boolean;
}

export interface HireRequest {
  id: string;
  project_id: string;
  project_name: string;
  tender_id: string | null;
  gc_id: string;
  gc_company_name: string;
  subcontractor: HireRequestSubcontractor;
  status: HireRequestStatus;
  trade: string;
  title: string;
  message: string | null;
  scope_description: string | null;
  proposed_amount: number | null;
  rate_type: RateType | null;
  unit_description: string | null;
  estimated_hours: number | null;
  estimated_start_date: string | null;
  estimated_end_date: string | null;
  response_deadline: string | null;
  sub_response: string | null;
  sub_counter_amount: number | null;
  unread_messages: number;
  contract_id: string | null;
  viewed_at: string | null;
  responded_at: string | null;
  hired_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface HireMessage {
  id: string;
  hire_request_id: string;
  sender_id: string;
  sender_name: string;
  sender_type: "gc" | "sub";
  message: string;
  message_type: "text" | "file" | "counter_offer" | "scope_change" | "schedule_change" | "system";
  metadata: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface PaymentMilestone {
  name: string;
  amount: number;
  due_upon: string;
  is_paid: boolean;
  paid_at: string | null;
}

export interface ContractSection {
  key: string;
  title: string;
  content: string;
  editable: boolean;
}

export interface TemplateVariable {
  key: string;
  label: string;
  type: string;
  options?: string[];
  required?: boolean;
  default?: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  description: string | null;
  template_type: "standard" | "time_materials" | "fixed_price" | "unit_price" | "master_service";
  content: string;
  sections: ContractSection[];
  variables: TemplateVariable[];
  is_system: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Contract {
  id: string;
  hire_request_id: string;
  project_id: string;
  project_name: string;
  template_id: string | null;
  template_name: string | null;
  contract_number: string | null;
  title: string;
  content: string;
  sections: ContractSection[];
  terms_summary: string | null;
  amount: number;
  payment_schedule: PaymentMilestone[];
  start_date: string | null;
  end_date: string | null;
  gc_signed: boolean;
  gc_signed_at: string | null;
  sub_signed: boolean;
  sub_signed_at: string | null;
  status: ContractStatus;
  pdf_path: string | null;
  notes: string | null;
  subcontractor: HireRequestSubcontractor;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  project_id: string;
  hire_request_id: string | null;
  contract_id: string | null;
  subcontractor: HireRequestSubcontractor;
  role: string | null;
  trade: string;
  responsibilities: string | null;
  start_date: string | null;
  end_date: string | null;
  hourly_rate: number | null;
  status: TeamMemberStatus;
  performance_rating: number | null;
  notes: string | null;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface SubcontractorReview {
  id: string;
  subcontractor_id: string | null;
  external_sub_id: string | null;
  reviewer_id: string;
  reviewer_name: string;
  project_id: string | null;
  project_name: string | null;
  rating: number;
  quality_rating: number | null;
  communication_rating: number | null;
  timeliness_rating: number | null;
  value_rating: number | null;
  title: string | null;
  comment: string | null;
  would_hire_again: boolean | null;
  is_verified: boolean;
  created_at: string;
}

// Input types for hiring
export interface CreateExternalSubInput {
  company_name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  trade: string;
  secondary_trades?: string[];
  location?: string;
  address?: string;
  license_number?: string;
  insurance_info?: string;
  notes?: string;
  is_preferred?: boolean;
}

export interface UpdateExternalSubInput extends Partial<CreateExternalSubInput> {
  rating?: number;
}

export interface CreateHireRequestInput {
  project_id: string;
  tender_id?: string;
  subcontractor_id?: string;
  external_sub_id?: string;
  trade: string;
  title: string;
  message?: string;
  scope_description?: string;
  proposed_amount?: number;
  rate_type?: RateType;
  unit_description?: string;
  estimated_hours?: number;
  estimated_start_date?: string;
  estimated_end_date?: string;
  response_deadline?: string;
  send_immediately?: boolean;
}

export interface UpdateHireRequestInput {
  title?: string;
  message?: string;
  scope_description?: string;
  proposed_amount?: number;
  rate_type?: RateType;
  unit_description?: string;
  estimated_hours?: number;
  estimated_start_date?: string;
  estimated_end_date?: string;
  response_deadline?: string;
}

export interface HireRequestStatusInput {
  status: HireRequestStatus;
  response?: string;
  counter_amount?: number;
}

export interface SendMessageInput {
  message: string;
  message_type?: HireMessage["message_type"];
  metadata?: Record<string, unknown>;
}

export interface CreateContractInput {
  hire_request_id: string;
  template_id?: string;
  title: string;
  content?: string;
  sections?: ContractSection[];
  terms_summary?: string;
  amount: number;
  payment_schedule?: PaymentMilestone[];
  start_date?: string;
  end_date?: string;
  notes?: string;
  variables?: Record<string, unknown>;
}

export interface UpdateContractInput {
  title?: string;
  content?: string;
  sections?: ContractSection[];
  terms_summary?: string;
  amount?: number;
  payment_schedule?: PaymentMilestone[];
  start_date?: string;
  end_date?: string;
  notes?: string;
}

export interface SignContractInput {
  signature: string;
  agreed_to_terms: boolean;
}

export interface AddTeamMemberInput {
  subcontractor_id?: string;
  external_sub_id?: string;
  hire_request_id?: string;
  contract_id?: string;
  role?: string;
  trade: string;
  responsibilities?: string;
  start_date?: string;
  end_date?: string;
  hourly_rate?: number;
  notes?: string;
}

export interface UpdateTeamMemberInput {
  role?: string;
  responsibilities?: string;
  start_date?: string;
  end_date?: string;
  hourly_rate?: number;
  status?: TeamMemberStatus;
  performance_rating?: number;
  notes?: string;
}
