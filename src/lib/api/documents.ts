import { apiGet, apiPost, apiDelete, apiUpload } from "./client";
import type { Document, CreateDocumentInput } from "@/types/models";
import type { PaginatedResponse, PaginationParams, DocumentUploadResponse } from "@/types/api";

export const documentsApi = {
  /**
   * List documents for a project
   */
  list: (projectId: string, params?: PaginationParams) =>
    apiGet<PaginatedResponse<Document>>(`/api/projects/${projectId}/documents`, params),

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
    metadata: CreateDocumentInput,
    onProgress?: (progress: number) => void
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", metadata.name);
    formData.append("document_type", metadata.document_type);
    if (metadata.description) formData.append("description", metadata.description);
    if (metadata.category) formData.append("category", metadata.category);
    if (metadata.author) formData.append("author", metadata.author);

    return apiUpload<DocumentUploadResponse>(
      `/api/projects/${projectId}/documents/upload`,
      formData,
      onProgress
    );
  },

  /**
   * Delete a document
   */
  delete: (projectId: string, documentId: string) =>
    apiDelete<void>(`/api/projects/${projectId}/documents/${documentId}`),
};
