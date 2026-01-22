/**
 * Hiring API client
 * Handles marketplace hiring: external subs, hire requests, contracts, messages, team
 */

import { apiGet, apiGetPaginated, apiPost, apiPut, apiDelete } from "./client";
import type {
  ExternalSubcontractor,
  HireRequest,
  HireMessage,
  Contract,
  ContractTemplate,
  TeamMember,
  CreateExternalSubInput,
  UpdateExternalSubInput,
  CreateHireRequestInput,
  UpdateHireRequestInput,
  HireRequestStatusInput,
  SendMessageInput,
  CreateContractInput,
  UpdateContractInput,
  SignContractInput,
  AddTeamMemberInput,
  UpdateTeamMemberInput,
} from "@/types/models";
import type { PaginationParams, FilterParams } from "@/types/api";

// ============================================
// External Subcontractors
// ============================================

export interface ExternalSubQueryParams extends PaginationParams, FilterParams {
  trade?: string;
  is_preferred?: boolean;
}

export async function listExternalSubcontractors(params?: ExternalSubQueryParams) {
  return apiGetPaginated<ExternalSubcontractor>("/my-subcontractors", params);
}

export async function getExternalSubcontractor(id: string): Promise<ExternalSubcontractor> {
  return apiGet<ExternalSubcontractor>(`/my-subcontractors/${id}`);
}

export async function createExternalSubcontractor(
  input: CreateExternalSubInput
): Promise<{ id: string; success: boolean }> {
  return apiPost("/my-subcontractors", input);
}

export async function updateExternalSubcontractor(
  id: string,
  input: UpdateExternalSubInput
): Promise<void> {
  await apiPut(`/my-subcontractors/${id}`, input);
}

export async function deleteExternalSubcontractor(id: string): Promise<void> {
  await apiDelete(`/my-subcontractors/${id}`);
}

// ============================================
// Hire Requests
// ============================================

export interface HireRequestQueryParams extends PaginationParams, FilterParams {
  project_id?: string;
  trade?: string;
  as_gc?: boolean;
  as_sub?: boolean;
}

export async function listHireRequests(params?: HireRequestQueryParams) {
  return apiGetPaginated<HireRequest>("/hiring", params);
}

export async function getHireRequest(id: string): Promise<HireRequest> {
  return apiGet<HireRequest>(`/hiring/${id}`);
}

export async function createHireRequest(
  input: CreateHireRequestInput
): Promise<{ id: string; status: string; success: boolean }> {
  return apiPost("/hiring", input);
}

export async function updateHireRequest(
  id: string,
  input: UpdateHireRequestInput
): Promise<void> {
  await apiPut(`/hiring/${id}`, input);
}

export async function updateHireRequestStatus(
  id: string,
  input: HireRequestStatusInput
): Promise<{ success: boolean; status: string }> {
  return apiPost(`/hiring/${id}/status`, input);
}

// ============================================
// Hire Messages
// ============================================

export async function listHireMessages(requestId: string): Promise<HireMessage[]> {
  return apiGet<HireMessage[]>(`/hiring/${requestId}/messages`);
}

export async function sendHireMessage(
  requestId: string,
  input: SendMessageInput
): Promise<{ id: string; success: boolean }> {
  return apiPost(`/hiring/${requestId}/messages`, input);
}

// ============================================
// Contracts
// ============================================

export async function listContractTemplates(): Promise<ContractTemplate[]> {
  return apiGet<ContractTemplate[]>("/contract-templates");
}

export async function getContract(id: string): Promise<Contract> {
  return apiGet<Contract>(`/contracts/${id}`);
}

export async function createContract(
  hireRequestId: string,
  input: CreateContractInput
): Promise<{ id: string; contract_number: string; success: boolean }> {
  return apiPost(`/hiring/${hireRequestId}/contract`, input);
}

export async function updateContract(
  id: string,
  input: UpdateContractInput
): Promise<void> {
  await apiPut(`/contracts/${id}`, input);
}

export async function signContract(
  id: string,
  input: SignContractInput
): Promise<{ success: boolean; status: string }> {
  return apiPost(`/contracts/${id}/sign`, input);
}

// ============================================
// Project Team
// ============================================

export async function listTeamMembers(projectId: string): Promise<TeamMember[]> {
  return apiGet<TeamMember[]>(`/projects/${projectId}/team`);
}

export async function addTeamMember(
  projectId: string,
  input: AddTeamMemberInput
): Promise<{ id: string; success: boolean }> {
  return apiPost(`/projects/${projectId}/team`, input);
}

export async function updateTeamMember(
  projectId: string,
  memberId: string,
  input: UpdateTeamMemberInput
): Promise<void> {
  await apiPut(`/projects/${projectId}/team/${memberId}`, input);
}

export async function removeTeamMember(
  projectId: string,
  memberId: string
): Promise<void> {
  await apiDelete(`/projects/${projectId}/team/${memberId}`);
}

// ============================================
// Export as namespace
// ============================================

export const hiringApi = {
  // External Subcontractors
  externalSubs: {
    list: listExternalSubcontractors,
    get: getExternalSubcontractor,
    create: createExternalSubcontractor,
    update: updateExternalSubcontractor,
    delete: deleteExternalSubcontractor,
  },

  // Hire Requests
  requests: {
    list: listHireRequests,
    get: getHireRequest,
    create: createHireRequest,
    update: updateHireRequest,
    updateStatus: updateHireRequestStatus,
  },

  // Messages
  messages: {
    list: listHireMessages,
    send: sendHireMessage,
  },

  // Contracts
  contracts: {
    listTemplates: listContractTemplates,
    get: getContract,
    create: createContract,
    update: updateContract,
    sign: signContract,
  },

  // Team
  team: {
    list: listTeamMembers,
    add: addTeamMember,
    update: updateTeamMember,
    remove: removeTeamMember,
  },
};
