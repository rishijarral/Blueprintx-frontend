"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useUser, useUpdateProfile } from "@/hooks/useAuth";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  Button,
  Input,
  Textarea,
  Avatar,
  Badge,
  Progress,
} from "@/components/ui";
import { SkeletonCard, SkeletonAvatar } from "@/components/ui/Skeleton";
import { useShowToast } from "@/components/ui/Toast";
import { profileApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { profileSchema, type ProfileFormData } from "@/types/forms";
import { USER_TYPE_LABELS } from "@/lib/constants/statuses";
import {
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  Save,
  Camera,
  Trash2,
  Briefcase,
  Settings,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

// ============================================
// Types
// ============================================

interface ProfileField {
  key: keyof ProfileFormData;
  label: string;
  weight: number;
}

// ============================================
// Constants
// ============================================

const PROFILE_FIELDS: ProfileField[] = [
  { key: "first_name", label: "First Name", weight: 20 },
  { key: "last_name", label: "Last Name", weight: 20 },
  { key: "company_name", label: "Company", weight: 15 },
  { key: "title", label: "Job Title", weight: 10 },
  { key: "phone", label: "Phone", weight: 15 },
  { key: "location", label: "Location", weight: 10 },
  { key: "bio", label: "Bio", weight: 10 },
];

// ============================================
// Helper Functions
// ============================================

function calculateProfileCompleteness(profile: ProfileFormData | null): {
  percentage: number;
  missingFields: string[];
} {
  if (!profile) return { percentage: 0, missingFields: PROFILE_FIELDS.map((f) => f.label) };

  let completedWeight = 0;
  const missingFields: string[] = [];

  for (const field of PROFILE_FIELDS) {
    const value = profile[field.key];
    if (value && String(value).trim() !== "") {
      completedWeight += field.weight;
    } else {
      missingFields.push(field.label);
    }
  }

  return {
    percentage: completedWeight,
    missingFields,
  };
}

function getCompletenessColor(percentage: number): "success" | "warning" | "error" {
  if (percentage >= 80) return "success";
  if (percentage >= 50) return "warning";
  return "error";
}

// ============================================
// Main Component
// ============================================

export default function ProfilePage() {
  const { user, profile, isLoading } = useUser();
  const queryClient = useQueryClient();
  const toast = useShowToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      company_name: "",
      first_name: "",
      last_name: "",
      phone: "",
      title: "",
      bio: "",
      location: "",
    },
  });

  // Watch form values for completeness calculation
  const formValues = watch();

  // Sync form with profile data
  useEffect(() => {
    if (profile) {
      reset({
        company_name: profile.company_name || "",
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        title: profile.title || "",
        bio: profile.bio || "",
        location: profile.location || "",
      });
    }
  }, [profile, reset]);

  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const onSubmit = (data: ProfileFormData) => {
    updateProfile(data, {
      onSuccess: () => {
        toast.success("Profile updated", "Your profile has been saved successfully.");
      },
      onError: (error) => {
        toast.error("Failed to update profile", error.message);
      },
    });
  };

  // Calculate profile completeness
  const { percentage: completeness, missingFields } = calculateProfileCompleteness(
    isDirty ? formValues : (profile as ProfileFormData | null)
  );

  const fullName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
    : "";

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your personal information and how others see you"
        breadcrumbs={[
          { label: "Dashboard", href: ROUTES.DASHBOARD },
          { label: "Profile" },
        ]}
        actions={
          <Link href={ROUTES.SETTINGS}>
            <Button variant="outline" size="sm" leftIcon={<Settings className="h-4 w-4" />}>
              Settings
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <ProfileSkeleton />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card variant="bordered">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details and public profile
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      {...register("first_name")}
                      label="First Name"
                      placeholder="John"
                      error={errors.first_name?.message}
                      required
                    />
                    <Input
                      {...register("last_name")}
                      label="Last Name"
                      placeholder="Doe"
                      error={errors.last_name?.message}
                      required
                    />
                  </div>

                  {/* Company & Title */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      {...register("company_name")}
                      label="Company Name"
                      placeholder="Acme Construction Inc."
                      leftIcon={<Building className="h-4 w-4" />}
                      error={errors.company_name?.message}
                    />
                    <Input
                      {...register("title")}
                      label="Job Title"
                      placeholder="Project Manager"
                      leftIcon={<Briefcase className="h-4 w-4" />}
                      error={errors.title?.message}
                    />
                  </div>

                  {/* Contact Info */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      {...register("phone")}
                      label="Phone Number"
                      placeholder="(555) 123-4567"
                      leftIcon={<Phone className="h-4 w-4" />}
                      error={errors.phone?.message}
                      type="tel"
                    />
                    <Input
                      {...register("location")}
                      label="Location"
                      placeholder="New York, NY"
                      leftIcon={<MapPin className="h-4 w-4" />}
                      error={errors.location?.message}
                    />
                  </div>

                  {/* Bio */}
                  <Textarea
                    {...register("bio")}
                    label="Bio"
                    placeholder="Tell us about yourself and your experience in the construction industry..."
                    rows={4}
                    error={errors.bio?.message}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground -mt-4">
                    {formValues.bio?.length || 0}/500 characters
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between border-t border-border pt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => reset()}
                    disabled={!isDirty || isPending}
                  >
                    Reset Changes
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isDirty}
                    isLoading={isPending}
                    leftIcon={<Save className="h-4 w-4" />}
                  >
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card with Avatar */}
            <Card variant="bordered">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <AvatarUpload
                    currentAvatarUrl={profile?.avatar_url}
                    name={fullName || user?.email}
                  />
                  <h2 className="mt-4 text-xl font-semibold">
                    {fullName || user?.email?.split("@")[0] || "User"}
                  </h2>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <Badge variant="secondary" className="mt-3">
                    {profile?.user_type ? USER_TYPE_LABELS[profile.user_type] : "User"}
                  </Badge>
                  {memberSince && (
                    <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Member since {memberSince}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Profile Completeness */}
            <Card variant="bordered">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {completeness >= 80 ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-warning" />
                  )}
                  Profile Completeness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {completeness}% complete
                    </span>
                    <span
                      className={`text-sm font-medium text-${getCompletenessColor(completeness)}`}
                    >
                      {completeness >= 80
                        ? "Great!"
                        : completeness >= 50
                        ? "Good progress"
                        : "Just started"}
                    </span>
                  </div>
                  <Progress
                    value={completeness}
                    variant={getCompletenessColor(completeness)}
                    size="md"
                  />
                </div>
                {missingFields.length > 0 && completeness < 100 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Complete your profile by adding:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {missingFields.slice(0, 3).map((field) => (
                        <li key={field} className="flex items-center gap-1">
                          <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                          {field}
                        </li>
                      ))}
                      {missingFields.length > 3 && (
                        <li className="text-muted-foreground/70">
                          +{missingFields.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card variant="bordered">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={ROUTES.SETTINGS} className="block">
                  <Button variant="ghost" className="w-full justify-start" leftIcon={<Settings className="h-4 w-4" />}>
                    Account Settings
                  </Button>
                </Link>
                {profile?.user_type === "sub" && (
                  <Link href="/marketplace/profile" className="block">
                    <Button variant="ghost" className="w-full justify-start" leftIcon={<User className="h-4 w-4" />}>
                      Marketplace Profile
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Avatar Upload Component
// ============================================

interface AvatarUploadProps {
  currentAvatarUrl: string | null | undefined;
  name: string | undefined;
}

function AvatarUpload({ currentAvatarUrl, name }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const toast = useShowToast();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const { mutate: uploadAvatar, isPending: isUploading } = useMutation({
    mutationFn: (file: File) =>
      profileApi.uploadAvatar(file, (progress) => setUploadProgress(progress)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      toast.success("Avatar updated", "Your profile picture has been changed.");
      setUploadProgress(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to upload avatar", error.message);
      setUploadProgress(null);
    },
  });

  const { mutate: deleteAvatar, isPending: isDeleting } = useMutation({
    mutationFn: () => profileApi.deleteAvatar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      toast.success("Avatar removed", "Your profile picture has been removed.");
    },
    onError: (error: Error) => {
      toast.error("Failed to remove avatar", error.message);
    },
  });

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "Invalid file type",
          "Please upload a JPEG, PNG, or WebP image."
        );
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File too large", "Please upload an image under 5MB.");
        return;
      }

      uploadAvatar(file);

      // Reset input to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [uploadAvatar, toast]
  );

  const isPending = isUploading || isDeleting;

  return (
    <div className="relative group">
      <div className="relative">
        <Avatar
          name={name}
          src={currentAvatarUrl || undefined}
          size="xl"
          className="h-24 w-24"
        />
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            {uploadProgress !== null ? (
              <span className="text-sm font-medium text-white">
                {uploadProgress}%
              </span>
            ) : (
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            )}
          </div>
        )}
      </div>

      {/* Action Buttons - Show on hover */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
          aria-label="Upload avatar"
        >
          <Camera className="h-4 w-4" />
        </button>
        {currentAvatarUrl && (
          <button
            type="button"
            onClick={() => deleteAvatar()}
            disabled={isPending}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive-hover transition-colors disabled:opacity-50"
            aria-label="Remove avatar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload avatar file"
      />
    </div>
  );
}

// ============================================
// Loading Skeleton
// ============================================

function ProfileSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <SkeletonCard />
      </div>
      <div className="space-y-6">
        <Card variant="bordered">
          <CardContent className="p-6 flex flex-col items-center">
            <SkeletonAvatar size="xl" />
            <div className="mt-4 h-6 w-32 rounded bg-muted animate-pulse" />
            <div className="mt-2 h-4 w-48 rounded bg-muted animate-pulse" />
          </CardContent>
        </Card>
        <SkeletonCard />
      </div>
    </div>
  );
}
