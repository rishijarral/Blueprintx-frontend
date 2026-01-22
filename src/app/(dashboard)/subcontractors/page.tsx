"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input, Select, Avatar } from "@/components/ui";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common";
import { subcontractorsApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { formatCurrency } from "@/lib/utils/format";
import { Search, Users, Star, MapPin, Briefcase, CheckCircle, ArrowRight } from "lucide-react";

export default function SubcontractorsPage() {
  const [search, setSearch] = useState("");
  const [tradeFilter, setTradeFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.subcontractors.list({ search: search || undefined }),
    queryFn: () => subcontractorsApi.list({ search: search || undefined }),
  });

  const subcontractors = data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subcontractor Directory"
        description="Find qualified subcontractors for your projects"
        breadcrumbs={[
          { label: "Dashboard", href: ROUTES.DASHBOARD },
          { label: "Subcontractors" },
        ]}
      />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Input
            placeholder="Search subcontractors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="bg-card"
          />
        </div>
        <div className="w-full sm:w-52">
          <Select
            options={[
              { value: "", label: "All Trades" },
              { value: "electrical", label: "Electrical" },
              { value: "plumbing", label: "Plumbing" },
              { value: "hvac", label: "HVAC" },
              { value: "roofing", label: "Roofing" },
              { value: "carpentry", label: "Carpentry" },
              { value: "concrete", label: "Concrete" },
              { value: "painting", label: "Painting" },
              { value: "masonry", label: "Masonry" },
              { value: "flooring", label: "Flooring" },
            ]}
            value={tradeFilter}
            onChange={(e) => setTradeFilter(e.target.value)}
            placeholder="All Trades"
            className="bg-card"
          />
        </div>
      </div>

      {/* Subcontractors Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : subcontractors.length === 0 ? (
        <Card variant="bordered">
          <CardContent className="p-6">
            <EmptyState
              icon={<Users className="h-8 w-8 text-muted-foreground" />}
              title="No subcontractors found"
              description={search ? "Try adjusting your search" : "No subcontractors available at this time"}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subcontractors.map((sub) => (
            <Card key={sub.id} variant="bordered" className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar name={sub.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{sub.name}</h3>
                      {sub.verified && (
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                      )}
                    </div>
                    <Badge variant="secondary" className="mt-1">
                      {sub.trade}
                    </Badge>
                  </div>
                </div>

                {sub.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {sub.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  {sub.rating && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Star className="h-4 w-4 text-warning fill-warning" />
                      <span className="font-medium text-foreground">{sub.rating.toFixed(1)}</span>
                      <span>({sub.review_count})</span>
                    </div>
                  )}
                  {sub.location && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{sub.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>{sub.projects_completed} projects</span>
                  </div>
                  {sub.average_bid_value && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span>Avg: {formatCurrency(sub.average_bid_value)}</span>
                    </div>
                  )}
                </div>

                {sub.specialties && sub.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {sub.specialties.slice(0, 3).map((specialty, index) => (
                      <Badge key={index} variant="outline" size="sm">
                        {specialty}
                      </Badge>
                    ))}
                    {sub.specialties.length > 3 && (
                      <Badge variant="outline" size="sm">
                        +{sub.specialties.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <Link href={ROUTES.SUBCONTRACTOR_DETAIL(sub.id)}>
                  <Button variant="outline" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
