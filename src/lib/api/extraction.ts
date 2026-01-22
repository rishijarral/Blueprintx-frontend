/**
 * Extraction API client
 * Handles AI-extracted data: materials, rooms, milestones, trade scopes
 */

import { apiGet, apiGetPaginated, apiPost, apiPut, apiDelete } from "./client";
import type {
  ExtractionSummary,
  ExtractedMaterial,
  ExtractedRoom,
  ProjectMilestone,
  ExtractedTradeScope,
  MaterialInput,
  RoomInput,
  MilestoneInput,
  TradeScopeInput,
} from "@/types/models";
import type { PaginationParams, FilterParams } from "@/types/api";

// ============================================
// Extraction Summary
// ============================================

export async function getExtractionSummary(projectId: string): Promise<ExtractionSummary> {
  return apiGet<ExtractionSummary>(`/projects/${projectId}/extraction`);
}

// ============================================
// Materials
// ============================================

export interface MaterialQueryParams extends PaginationParams, FilterParams {
  trade_category?: string;
  room?: string;
  is_verified?: boolean;
}

export async function listMaterials(
  projectId: string,
  params?: MaterialQueryParams
) {
  return apiGetPaginated<ExtractedMaterial>(
    `/projects/${projectId}/extraction/materials`,
    params
  );
}

export async function createMaterial(
  projectId: string,
  input: MaterialInput
): Promise<ExtractedMaterial> {
  return apiPost<ExtractedMaterial>(
    `/projects/${projectId}/extraction/materials`,
    input
  );
}

export async function updateMaterial(
  projectId: string,
  materialId: string,
  input: MaterialInput
): Promise<ExtractedMaterial> {
  return apiPut<ExtractedMaterial>(
    `/projects/${projectId}/extraction/materials/${materialId}`,
    input
  );
}

export async function deleteMaterial(
  projectId: string,
  materialId: string
): Promise<void> {
  await apiDelete(`/projects/${projectId}/extraction/materials/${materialId}`);
}

export async function verifyMaterial(
  projectId: string,
  materialId: string,
  isVerified: boolean
): Promise<void> {
  await apiPost(`/projects/${projectId}/extraction/materials/${materialId}/verify`, {
    is_verified: isVerified,
  });
}

// ============================================
// Rooms
// ============================================

export interface RoomQueryParams extends PaginationParams, FilterParams {
  floor?: string;
  room_type?: string;
  is_verified?: boolean;
}

export async function listRooms(
  projectId: string,
  params?: RoomQueryParams
) {
  return apiGetPaginated<ExtractedRoom>(
    `/projects/${projectId}/extraction/rooms`,
    params
  );
}

export async function createRoom(
  projectId: string,
  input: RoomInput
): Promise<{ id: string; success: boolean }> {
  return apiPost(`/projects/${projectId}/extraction/rooms`, input);
}

export async function updateRoom(
  projectId: string,
  roomId: string,
  input: RoomInput
): Promise<void> {
  await apiPut(`/projects/${projectId}/extraction/rooms/${roomId}`, input);
}

export async function deleteRoom(
  projectId: string,
  roomId: string
): Promise<void> {
  await apiDelete(`/projects/${projectId}/extraction/rooms/${roomId}`);
}

// ============================================
// Milestones
// ============================================

export interface MilestoneQueryParams extends PaginationParams, FilterParams {
  phase?: string;
  is_verified?: boolean;
}

export async function listMilestones(
  projectId: string,
  params?: MilestoneQueryParams
) {
  return apiGetPaginated<ProjectMilestone>(
    `/projects/${projectId}/extraction/milestones`,
    params
  );
}

export async function createMilestone(
  projectId: string,
  input: MilestoneInput
): Promise<{ id: string; success: boolean }> {
  return apiPost(`/projects/${projectId}/extraction/milestones`, input);
}

export async function updateMilestone(
  projectId: string,
  milestoneId: string,
  input: MilestoneInput
): Promise<void> {
  await apiPut(
    `/projects/${projectId}/extraction/milestones/${milestoneId}`,
    input
  );
}

export async function deleteMilestone(
  projectId: string,
  milestoneId: string
): Promise<void> {
  await apiDelete(`/projects/${projectId}/extraction/milestones/${milestoneId}`);
}

// ============================================
// Trade Scopes
// ============================================

export interface TradeScopeQueryParams extends PaginationParams, FilterParams {
  trade?: string;
  is_verified?: boolean;
}

export async function listTradeScopes(
  projectId: string,
  params?: TradeScopeQueryParams
) {
  return apiGetPaginated<ExtractedTradeScope>(
    `/projects/${projectId}/extraction/trade-scopes`,
    params
  );
}

export async function createTradeScope(
  projectId: string,
  input: TradeScopeInput
): Promise<{ id: string; success: boolean }> {
  return apiPost(`/projects/${projectId}/extraction/trade-scopes`, input);
}

export async function updateTradeScope(
  projectId: string,
  scopeId: string,
  input: TradeScopeInput
): Promise<void> {
  await apiPut(
    `/projects/${projectId}/extraction/trade-scopes/${scopeId}`,
    input
  );
}

export async function deleteTradeScope(
  projectId: string,
  scopeId: string
): Promise<void> {
  await apiDelete(`/projects/${projectId}/extraction/trade-scopes/${scopeId}`);
}

// ============================================
// Export as namespace
// ============================================

export const extractionApi = {
  // Summary
  getSummary: getExtractionSummary,

  // Materials
  materials: {
    list: listMaterials,
    create: createMaterial,
    update: updateMaterial,
    delete: deleteMaterial,
    verify: verifyMaterial,
  },

  // Rooms
  rooms: {
    list: listRooms,
    create: createRoom,
    update: updateRoom,
    delete: deleteRoom,
  },

  // Milestones
  milestones: {
    list: listMilestones,
    create: createMilestone,
    update: updateMilestone,
    delete: deleteMilestone,
  },

  // Trade Scopes
  tradeScopes: {
    list: listTradeScopes,
    create: createTradeScope,
    update: updateTradeScope,
    delete: deleteTradeScope,
  },
};
