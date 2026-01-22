"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent, Badge, Button, Card, CardContent } from "@/components/ui";
import { LoadingPage, EmptyState } from "@/components/common";
import { ProjectOverview } from "@/components/features/projects/ProjectOverview";
import { ProjectDocuments } from "@/components/features/projects/ProjectDocuments";
import { ProjectTenders } from "@/components/features/projects/ProjectTenders";
import { ProjectTasks } from "@/components/features/projects/ProjectTasks";
import { ProjectRFIs } from "@/components/features/projects/ProjectRFIs";
import { projectsApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS } from "@/lib/constants/statuses";
import { Edit, Settings, FileText, FolderKanban, CheckSquare, MessageSquare, Brain } from "lucide-react";
import Link from "next/link";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "overview";

  const { data: project, isLoading, error } = useQuery({
    queryKey: queryKeys.projects.detail(resolvedParams.id),
    queryFn: () => projectsApi.get(resolvedParams.id),
  });

  if (isLoading) {
    return <LoadingPage message="Loading project..." />;
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <EmptyState
          icon={<FolderKanban className="h-8 w-8 text-muted-foreground" />}
          title="Project not found"
          description="The project you're looking for doesn't exist or you don't have access."
          action={{
            label: "Back to Projects",
            onClick: () => (window.location.href = ROUTES.PROJECTS),
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.name}
        description={project.description || undefined}
        breadcrumbs={[
          { label: "Dashboard", href: ROUTES.DASHBOARD },
          { label: "Projects", href: ROUTES.PROJECTS },
          { label: project.name },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Badge className={PROJECT_STATUS_COLORS[project.status]} size="md">
              {PROJECT_STATUS_LABELS[project.status]}
            </Badge>
            <Link href={`${ROUTES.PROJECT_DETAIL(project.id)}?edit=true`}>
              <Button variant="outline" leftIcon={<Edit className="h-4 w-4" />}>
                Edit
              </Button>
            </Link>
          </div>
        }
      />

      <Tabs defaultValue={defaultTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">
            <FolderKanban className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="tenders">
            <FileText className="h-4 w-4 mr-2" />
            Tenders
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <CheckSquare className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="rfis">
            <MessageSquare className="h-4 w-4 mr-2" />
            RFIs
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Brain className="h-4 w-4 mr-2" />
            AI Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ProjectOverview project={project} />
        </TabsContent>

        <TabsContent value="documents">
          <ProjectDocuments projectId={project.id} />
        </TabsContent>

        <TabsContent value="tenders">
          <ProjectTenders projectId={project.id} />
        </TabsContent>

        <TabsContent value="tasks">
          <ProjectTasks projectId={project.id} />
        </TabsContent>

        <TabsContent value="rfis">
          <ProjectRFIs projectId={project.id} />
        </TabsContent>

        <TabsContent value="ai">
          <Card variant="bordered">
            <CardContent className="p-6">
              <EmptyState
                icon={<Brain className="h-8 w-8 text-muted-foreground" />}
                title="AI Analysis Coming Soon"
                description="Upload documents to get AI-powered plan summaries, trade scope extraction, and intelligent Q&A."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
