"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Modal, Input, Select, Textarea } from "@/components/ui";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common";
import { useShowToast } from "@/components/ui/Toast";
import { documentsApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { formatDate, formatFileSize } from "@/lib/utils/format";
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS } from "@/lib/constants/statuses";
import { Plus, Upload, FileText, Trash2, Download, Eye } from "lucide-react";
import type { CreateDocumentInput } from "@/types/models";

interface ProjectDocumentsProps {
  projectId: string;
}

export function ProjectDocuments({ projectId }: ProjectDocumentsProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState<CreateDocumentInput>({
    name: "",
    description: "",
    document_type: "plan",
    category: "",
    author: "",
  });

  const queryClient = useQueryClient();
  const toast = useShowToast();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.documents.list(projectId),
    queryFn: () => documentsApi.list(projectId),
  });

  const documents = data?.data || [];

  const { mutate: uploadDocument, isPending: isUploading } = useMutation({
    mutationFn: () => {
      if (!selectedFile) throw new Error("No file selected");
      return documentsApi.upload(projectId, selectedFile, formData, setUploadProgress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all(projectId) });
      toast.success("Document uploaded", "Your document has been uploaded and is being processed.");
      handleCloseModal();
    },
    onError: (error: Error) => {
      toast.error("Upload failed", error.message);
    },
  });

  const { mutate: deleteDocument } = useMutation({
    mutationFn: (documentId: string) => documentsApi.delete(projectId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all(projectId) });
      toast.success("Document deleted", "The document has been removed.");
    },
    onError: (error: Error) => {
      toast.error("Delete failed", error.message);
    },
  });

  const handleCloseModal = useCallback(() => {
    setIsUploadModalOpen(false);
    setSelectedFile(null);
    setUploadProgress(0);
    setFormData({
      name: "",
      description: "",
      document_type: "plan",
      category: "",
      author: "",
    });
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!formData.name) {
        setFormData((prev) => ({ ...prev, name: file.name.replace(/\.[^/.]+$/, "") }));
      }
    }
  }, [formData.name]);

  const documentTypeOptions = Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <div className="space-y-6">
      <Card variant="bordered">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Documents</CardTitle>
          <Button
            leftIcon={<Upload className="h-4 w-4" />}
            onClick={() => setIsUploadModalOpen(true)}
          >
            Upload Document
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SkeletonTable rows={3} cols={5} />
          ) : documents.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-8 w-8 text-muted-foreground" />}
              title="No documents yet"
              description="Upload project blueprints, specifications, and other documents"
              action={{
                label: "Upload Document",
                onClick: () => setIsUploadModalOpen(true),
                icon: <Upload className="h-4 w-4" />,
              }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          {doc.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {doc.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {DOCUMENT_TYPE_LABELS[doc.document_type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {doc.file_size ? formatFileSize(doc.file_size) : "—"}
                    </TableCell>
                    <TableCell>{formatDate(doc.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteDocument(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={handleCloseModal}
        title="Upload Document"
        description="Upload a document to this project"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              onClick={() => uploadDocument()}
              isLoading={isUploading}
              disabled={!selectedFile}
            >
              {isUploading ? `Uploading ${uploadProgress}%` : "Upload"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium mb-2">File</label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.dxf"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                {selectedFile ? (
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, DOC, XLS, DWG up to 100MB
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          <Input
            label="Document Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter document name"
            required
          />

          <Select
            label="Document Type"
            options={documentTypeOptions}
            value={formData.document_type}
            onChange={(e) =>
              setFormData({ ...formData, document_type: e.target.value as typeof formData.document_type })
            }
          />

          <Textarea
            label="Description"
            value={formData.description || ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Optional description..."
            rows={2}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Category"
              value={formData.category || ""}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Structural"
            />
            <Input
              label="Author"
              value={formData.author || ""}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="e.g., John Architect"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
