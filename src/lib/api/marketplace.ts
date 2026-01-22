/**
 * Marketplace API client
 * Handles enhanced subcontractor directory, profile management, portfolio, saved searches,
 * marketplace tenders, and bidding.
 */

import { apiGet, apiGetPaginated, apiPost, apiPut, apiDelete } from "./client";
import type { PaginationParams, SortParams, FilterParams } from "@/types/api";

// ============================================
// Types - Subcontractor Profile
// ============================================

export interface Certification {
  name: string;
  issuer?: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  verified: boolean;
}

export interface InsuranceInfo {
  general_liability?: number;
  workers_comp?: number;
  auto_liability?: number;
  expiry_date?: string;
  carrier?: string;
  verified: boolean;
}

export interface LicenseInfo {
  number?: string;
  state?: string;
  license_type?: string;
  expiry_date?: string;
  verified: boolean;
}

export interface RecentProject {
  name: string;
  trade: string;
  value?: number;
  completed_date?: string;
}

export interface SubcontractorProfile {
  id: string;
  profile_id?: string;
  name: string;
  trade: string;
  secondary_trades: string[];
  headline?: string;
  company_description?: string;
  rating: number;
  review_count: number;
  location?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  projects_completed: number;
  average_bid_value?: number;
  response_time?: string;
  response_time_hours?: number;
  verified: boolean;
  verification_status: "pending" | "verified" | "rejected";
  specialties: string[];
  service_areas: string[];
  certifications: Certification[];
  insurance?: InsuranceInfo;
  license_info?: LicenseInfo;
  year_established?: number;
  employee_count?: string;
  min_project_value?: number;
  max_project_value?: number;
  availability_status: "available" | "busy" | "not_taking_work";
  recent_projects: RecentProject[];
  portfolio_count: number;
  created_at: string;
}

// ============================================
// Types - Portfolio
// ============================================

export interface PortfolioProject {
  id: string;
  title: string;
  description?: string;
  project_type?: string;
  trade_category?: string;
  location?: string;
  completion_date?: string;
  project_value?: number;
  client_name?: string;
  client_testimonial?: string;
  images: string[];
  is_featured: boolean;
  display_order: number;
  created_at: string;
}

export interface PortfolioProjectInput {
  title: string;
  description?: string;
  project_type?: string;
  trade_category?: string;
  location?: string;
  completion_date?: string;
  project_value?: number;
  client_name?: string;
  client_testimonial?: string;
  images?: string[];
  is_featured?: boolean;
  display_order?: number;
}

// ============================================
// Types - Saved Searches
// ============================================

export interface SavedSearch {
  id: string;
  name: string;
  search_type: string;
  filters: Record<string, unknown>;
  notify_new_matches: boolean;
  last_run_at?: string;
  created_at: string;
}

export interface CreateSavedSearchInput {
  name: string;
  search_type?: string;
  filters: Record<string, unknown>;
  notify_new_matches?: boolean;
}

// ============================================
// Types - Marketplace Tenders
// ============================================

export interface MarketplaceBidSummary {
  id: string;
  bid_amount: number;
  status: string;
  submitted_at?: string;
}

export interface MarketplaceTender {
  id: string;
  project_id: string;
  project_name?: string;
  gc_company_name?: string;
  name: string;
  description?: string;
  trade_category: string;
  scope_of_work?: string;
  location?: string;
  status: string;
  visibility: string;
  bid_due_date?: string;
  estimated_value?: number;
  reserve_price?: number;
  requirements: Record<string, unknown>;
  bids_received: number;
  priority?: string;
  created_at: string;
  my_bid?: MarketplaceBidSummary;
}

// ============================================
// Types - Bidding
// ============================================

export interface BidLineItem {
  description: string;
  quantity?: number;
  unit?: string;
  unit_price?: number;
  total: number;
}

export interface SubmitBidInput {
  bid_amount: number;
  breakdown?: BidLineItem[];
  proposed_timeline_days?: number;
  proposed_start_date?: string;
  cover_letter?: string;
  notes?: string;
}

export interface MarketplaceBid {
  id: string;
  tender_id: string;
  tender_name?: string;
  project_name?: string;
  subcontractor_id?: string;
  company_name: string;
  bid_amount: number;
  breakdown: BidLineItem[];
  proposed_timeline_days?: number;
  proposed_start_date?: string;
  cover_letter?: string;
  status: string;
  is_winning_bid: boolean;
  notes?: string;
  submitted_at?: string;
  created_at: string;
}

// ============================================
// Types - Profile Update
// ============================================

export interface UpdateMarketplaceProfileInput {
  name?: string;
  headline?: string;
  company_description?: string;
  trade?: string;
  secondary_trades?: string[];
  location?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  specialties?: string[];
  service_areas?: string[];
  certifications?: Certification[];
  insurance?: InsuranceInfo;
  license_info?: LicenseInfo;
  year_established?: number;
  employee_count?: string;
  min_project_value?: number;
  max_project_value?: number;
  availability_status?: string;
}

// ============================================
// Query Params
// ============================================

export interface MarketplaceSubQueryParams
  extends PaginationParams,
    SortParams,
    FilterParams {
  trade?: string;
  trades?: string[];
  location?: string;
  verified_only?: boolean;
  min_rating?: number;
  availability?: string;
  min_project_value?: number;
  max_project_value?: number;
  has_insurance?: boolean;
}

export interface MarketplaceTenderQueryParams
  extends PaginationParams,
    SortParams,
    FilterParams {
  trade?: string;
  trades?: string[];
  location?: string;
  min_value?: number;
  max_value?: number;
  due_within_days?: number;
}

// ============================================
// API Functions - Subcontractor Directory
// ============================================

/**
 * List subcontractors in the marketplace
 */
export async function listMarketplaceSubcontractors(
  params?: MarketplaceSubQueryParams
) {
  return apiGetPaginated<SubcontractorProfile>(
    "/marketplace/subcontractors",
    params
  );
}

/**
 * Get a subcontractor's full profile
 */
export async function getMarketplaceSubcontractor(
  id: string
): Promise<SubcontractorProfile> {
  return apiGet<SubcontractorProfile>(`/marketplace/subcontractors/${id}`);
}

/**
 * Get a subcontractor's portfolio
 */
export async function getSubcontractorPortfolio(
  id: string
): Promise<PortfolioProject[]> {
  return apiGet<PortfolioProject[]>(`/marketplace/subcontractors/${id}/portfolio`);
}

// ============================================
// API Functions - My Profile (for Subs)
// ============================================

/**
 * Get the current user's subcontractor profile
 */
export async function getMyMarketplaceProfile(): Promise<SubcontractorProfile> {
  return apiGet<SubcontractorProfile>("/marketplace/profile");
}

/**
 * Update the current user's subcontractor profile
 */
export async function updateMyMarketplaceProfile(
  input: UpdateMarketplaceProfileInput
): Promise<{ success: boolean }> {
  return apiPut("/marketplace/profile", input);
}

/**
 * Request verification for the subcontractor profile
 */
export async function requestVerification(): Promise<{
  success: boolean;
  message: string;
}> {
  return apiPost("/marketplace/profile/request-verification", {});
}

// ============================================
// API Functions - Portfolio
// ============================================

/**
 * Get the current user's portfolio
 */
export async function getMyPortfolio(): Promise<PortfolioProject[]> {
  return apiGet<PortfolioProject[]>("/marketplace/profile/portfolio");
}

/**
 * Create a portfolio project
 */
export async function createPortfolioProject(
  input: PortfolioProjectInput
): Promise<{ id: string; success: boolean }> {
  return apiPost("/marketplace/profile/portfolio", input);
}

/**
 * Update a portfolio project
 */
export async function updatePortfolioProject(
  id: string,
  input: PortfolioProjectInput
): Promise<{ success: boolean }> {
  return apiPut(`/marketplace/profile/portfolio/${id}`, input);
}

/**
 * Delete a portfolio project
 */
export async function deletePortfolioProject(id: string): Promise<void> {
  await apiDelete(`/marketplace/profile/portfolio/${id}`);
}

// ============================================
// API Functions - Saved Searches
// ============================================

/**
 * List saved searches
 */
export async function listSavedSearches(): Promise<SavedSearch[]> {
  return apiGet<SavedSearch[]>("/marketplace/saved-searches");
}

/**
 * Create a saved search
 */
export async function createSavedSearch(
  input: CreateSavedSearchInput
): Promise<{ id: string; success: boolean }> {
  return apiPost("/marketplace/saved-searches", input);
}

/**
 * Delete a saved search
 */
export async function deleteSavedSearch(id: string): Promise<void> {
  await apiDelete(`/marketplace/saved-searches/${id}`);
}

// ============================================
// API Functions - Marketplace Tenders
// ============================================

/**
 * List open tenders in the marketplace
 */
export async function listMarketplaceTenders(
  params?: MarketplaceTenderQueryParams
) {
  return apiGetPaginated<MarketplaceTender>("/marketplace/tenders", params);
}

/**
 * Get a tender for bidding
 */
export async function getMarketplaceTender(
  id: string
): Promise<MarketplaceTender> {
  return apiGet<MarketplaceTender>(`/marketplace/tenders/${id}`);
}

// ============================================
// API Functions - Bidding
// ============================================

/**
 * Submit a bid on a tender
 */
export async function submitBid(
  tenderId: string,
  input: SubmitBidInput
): Promise<{ id: string; success: boolean }> {
  return apiPost(`/marketplace/tenders/${tenderId}/bid`, input);
}

/**
 * Update an existing bid
 */
export async function updateBid(
  tenderId: string,
  input: SubmitBidInput
): Promise<{ success: boolean }> {
  return apiPut(`/marketplace/tenders/${tenderId}/bid`, input);
}

/**
 * Withdraw a bid
 */
export async function withdrawBid(tenderId: string): Promise<void> {
  await apiDelete(`/marketplace/tenders/${tenderId}/bid`);
}

/**
 * List the current user's submitted bids
 */
export async function listMyBids(params?: PaginationParams) {
  return apiGetPaginated<MarketplaceBid>("/marketplace/my-bids", params);
}

// ============================================
// Export as namespace
// ============================================

export const marketplaceApi = {
  // Subcontractor Directory
  subcontractors: {
    list: listMarketplaceSubcontractors,
    get: getMarketplaceSubcontractor,
    getPortfolio: getSubcontractorPortfolio,
  },

  // My Profile
  profile: {
    get: getMyMarketplaceProfile,
    update: updateMyMarketplaceProfile,
    requestVerification,
  },

  // Portfolio
  portfolio: {
    list: getMyPortfolio,
    create: createPortfolioProject,
    update: updatePortfolioProject,
    delete: deletePortfolioProject,
  },

  // Saved Searches
  savedSearches: {
    list: listSavedSearches,
    create: createSavedSearch,
    delete: deleteSavedSearch,
  },

  // Tenders
  tenders: {
    list: listMarketplaceTenders,
    get: getMarketplaceTender,
  },

  // Bidding
  bids: {
    submit: submitBid,
    update: updateBid,
    withdraw: withdrawBid,
    listMy: listMyBids,
  },
};
