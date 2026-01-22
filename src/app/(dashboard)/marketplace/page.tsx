"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Input,
  Select,
  Avatar,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common";
import { marketplaceApi } from "@/lib/api/marketplace";
import { subcontractorsApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import {
  Search,
  Users,
  Star,
  MapPin,
  Briefcase,
  CheckCircle,
  ArrowRight,
  SlidersHorizontal,
  UserPlus,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  Building2,
  Send,
} from "lucide-react";

const TRADE_OPTIONS = [
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
  { value: "drywall", label: "Drywall" },
  { value: "framing", label: "Framing" },
  { value: "insulation", label: "Insulation" },
  { value: "fire_protection", label: "Fire Protection" },
  { value: "landscaping", label: "Landscaping" },
];

const RATING_OPTIONS = [
  { value: "", label: "Any Rating" },
  { value: "4", label: "4+ Stars" },
  { value: "4.5", label: "4.5+ Stars" },
  { value: "5", label: "5 Stars Only" },
];

export default function MarketplacePage() {
  // Default tab - show tenders first as it's more action-oriented
  const [activeTab, setActiveTab] = useState<string>("tenders");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketplace"
        description="Find open tenders to bid on, or browse qualified subcontractors to hire"
        breadcrumbs={[
          { label: "Dashboard", href: ROUTES.DASHBOARD },
          { label: "Marketplace" },
        ]}
        actions={
          <div className="flex gap-2">
            <Link href="/marketplace/my-bids">
              <Button variant="outline" leftIcon={<FileText className="h-4 w-4" />}>
                My Bids
              </Button>
            </Link>
            <Link href={ROUTES.MY_SUBCONTRACTORS}>
              <Button variant="outline" leftIcon={<Users className="h-4 w-4" />}>
                My Subs
              </Button>
            </Link>
            <Link href="/marketplace/profile">
              <Button variant="primary" leftIcon={<UserPlus className="h-4 w-4" />}>
                My Profile
              </Button>
            </Link>
          </div>
        }
      />

      <Tabs value={activeTab} defaultValue="tenders" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tenders">
            <FileText className="h-4 w-4 mr-2" />
            Open Tenders
          </TabsTrigger>
          <TabsTrigger value="subcontractors">
            <Users className="h-4 w-4 mr-2" />
            Subcontractors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tenders" className="mt-6">
          <TendersTab />
        </TabsContent>

        <TabsContent value="subcontractors" className="mt-6">
          <SubcontractorsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================
// Tenders Tab (for Subs to Browse & Bid)
// ============================================

function TendersTab() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [tradeFilter, setTradeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.marketplace.tenders.list({
      search: search || undefined,
      trade: tradeFilter || undefined,
      location: locationFilter || undefined,
    }),
    queryFn: () =>
      marketplaceApi.tenders.list({
        search: search || undefined,
        trade: tradeFilter || undefined,
        location: locationFilter || undefined,
        per_page: 20,
      }),
  });

  const tenders = data?.data || [];

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Input
              placeholder="Search tenders by name, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              className="bg-card"
            />
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-full sm:w-48">
              <Select
                options={TRADE_OPTIONS}
                value={tradeFilter}
                onChange={(e) => setTradeFilter(e.target.value)}
                placeholder="All Trades"
                className="bg-card"
              />
            </div>
            <Button
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 px-4 flex-shrink-0"
            >
              <SlidersHorizontal className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-muted/50 border border-border">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Location
              </label>
              <Input
                placeholder="City or state..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                leftIcon={<MapPin className="h-4 w-4" />}
                className="bg-card"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading..." : `${tenders.length} open tenders`}
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : tenders.length === 0 ? (
        <Card variant="bordered">
          <CardContent className="p-6">
            <EmptyState
              icon={<FileText className="h-8 w-8 text-muted-foreground" />}
              title="No open tenders found"
              description={
                search || tradeFilter || locationFilter
                  ? "Try adjusting your filters"
                  : "No tenders available at this time. Check back later!"
              }
              action={
                search || tradeFilter || locationFilter
                  ? {
                      label: "Clear Filters",
                      onClick: () => {
                        setSearch("");
                        setTradeFilter("");
                        setLocationFilter("");
                      },
                    }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tenders.map((tender) => (
            <Card
              key={tender.id}
              variant="bordered"
              className="hover:shadow-md transition-shadow group cursor-pointer"
              onClick={() => router.push(`/marketplace/tenders/${tender.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="secondary">{tender.trade_category}</Badge>
                  {tender.my_bid && (
                    <Badge variant="success" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Bid Submitted
                    </Badge>
                  )}
                </div>

                <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                  {tender.name}
                </h3>
                
                {tender.gc_company_name && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                    <Building2 className="h-3.5 w-3.5" />
                    {tender.gc_company_name}
                  </p>
                )}

                {tender.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {tender.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  {tender.location && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{tender.location}</span>
                    </div>
                  )}
                  {tender.bid_due_date && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Due {formatDate(tender.bid_due_date)}</span>
                    </div>
                  )}
                  {tender.estimated_value && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatCurrency(tender.estimated_value / 100)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{tender.bids_received} bids</span>
                  </div>
                </div>

                {tender.reserve_price && (
                  <div className="text-xs text-muted-foreground mb-4 p-2 bg-muted/50 rounded">
                    Reserve Price: {formatCurrency(tender.reserve_price / 100)}
                  </div>
                )}

                <Button
                  variant="primary"
                  className="w-full"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  {tender.my_bid ? "View Bid" : "View & Bid"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Subcontractors Tab (for GCs to Browse & Hire)
// ============================================

function SubcontractorsTab() {
  const [search, setSearch] = useState("");
  const [tradeFilter, setTradeFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.marketplace.subcontractors.list({
      search: search || undefined,
      trade: tradeFilter || undefined,
      location: locationFilter || undefined,
      verified_only: verifiedOnly || undefined,
      min_rating: ratingFilter ? parseFloat(ratingFilter) : undefined,
    }),
    queryFn: () =>
      marketplaceApi.subcontractors.list({
        search: search || undefined,
        trade: tradeFilter || undefined,
        location: locationFilter || undefined,
        verified_only: verifiedOnly || undefined,
        min_rating: ratingFilter ? parseFloat(ratingFilter) : undefined,
        per_page: 20,
      }),
  });

  const subcontractors = data?.data || [];

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Input
              placeholder="Search subcontractors by name, specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              className="bg-card"
            />
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-full sm:w-48">
              <Select
                options={TRADE_OPTIONS}
                value={tradeFilter}
                onChange={(e) => setTradeFilter(e.target.value)}
                placeholder="All Trades"
                className="bg-card"
              />
            </div>
            <Button
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 px-4 flex-shrink-0"
            >
              <SlidersHorizontal className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-muted/50 border border-border">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Location
              </label>
              <Input
                placeholder="City or state..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                leftIcon={<MapPin className="h-4 w-4" />}
                className="bg-card"
              />
            </div>
            <div className="w-full sm:w-40">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Rating
              </label>
              <Select
                options={RATING_OPTIONS}
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="bg-card"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer h-12 px-3 rounded-xl bg-card border border-input hover:border-primary/50 transition-colors">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-sm font-medium">Verified Only</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading..." : `${subcontractors.length} subcontractors found`}
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" size="sm">
            <CheckCircle className="h-3 w-3 mr-1" />
            Platform Verified
          </Badge>
        </div>
      </div>

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
              description={
                search || tradeFilter || locationFilter || ratingFilter
                  ? "Try adjusting your filters"
                  : "No subcontractors available at this time"
              }
              action={
                search || tradeFilter || locationFilter || ratingFilter
                  ? {
                      label: "Clear Filters",
                      onClick: () => {
                        setSearch("");
                        setTradeFilter("");
                        setLocationFilter("");
                        setRatingFilter("");
                        setVerifiedOnly(false);
                      },
                    }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subcontractors.map((sub) => (
            <Card
              key={sub.id}
              variant="bordered"
              className="hover:shadow-md transition-shadow group"
            >
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
                    {sub.availability_status === "available" && (
                      <Badge variant="success" size="sm" className="ml-1">
                        Available
                      </Badge>
                    )}
                  </div>
                </div>

                {sub.headline && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {sub.headline}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  {sub.rating > 0 && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Star className="h-4 w-4 text-warning fill-warning" />
                      <span className="font-medium text-foreground">
                        {sub.rating.toFixed(1)}
                      </span>
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
                  {sub.response_time && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{sub.response_time}</span>
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

                <div className="flex gap-2">
                  <Link href={`/marketplace/subcontractors/${sub.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full"
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      View Profile
                    </Button>
                  </Link>
                  <Link href={`${ROUTES.HIRING}?sub=${sub.id}`}>
                    <Button variant="primary" leftIcon={<Send className="h-4 w-4" />}>
                      Hire
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
