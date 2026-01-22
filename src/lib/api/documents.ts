import {
  apiGet,
  apiGetPaginated,
  apiPost,
  apiDelete,
  apiUpload,
} from "./client";
import type { Document, CreateDocumentInput } from "@/types/models";
import type {
  PaginatedResponse,
  PaginationParams,
  DocumentUploadResponse,
} from "@/types/api";

export const documentsApi = {
  /**
   * List documents for a project
   */
  list: (projectId: string, params?: PaginationParams) =>
    apiGetPaginated<Document>(`/api/projects/${projectId}/documents`, params),

  /**
   * Get a single document
   */
  get: (projectId: string, documentId: string) =>
    apiGet<Document>(`/api/projects/${projectId}/documents/${documentId}`),

  /**
   * Create document metadata
   */
  create: (projectId: string, data: CreateDocumentInput) =>
    apiPost<Document>(`/api/projects/${projectId}/documents`, data),

  /**
   * Upload a document file
   */
  upload: (
    projectId: string,
    file: File,
    metadata?: Partial<CreateDocumentInput>,
    onProgress?: (progress: number) => void,
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    if (metadata?.document_type) {
      formData.append("document_type", metadata.document_type);
    }

    return apiUpload<DocumentUploadResponse>(
      `/api/projects/${projectId}/documents/upload`,
      formData,
      onProgress,
    );
  },

  /**
   * Delete a document
   */
  delete: (projectId: string, documentId: string) =>
    apiDelete<void>(`/api/projects/${projectId}/documents/${documentId}`),
};
