"use client";

import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser, useUpdateProfile } from "@/hooks/useAuth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Textarea, Avatar, Badge } from "@/components/ui";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useShowToast } from "@/components/ui/Toast";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { profileSchema, type ProfileFormData } from "@/types/forms";
import { USER_TYPE_LABELS } from "@/lib/constants/statuses";
import { User, Building, Mail, Phone, MapPin, Save } from "lucide-react";

export default function ProfilePage() {
  const { user, profile, isLoading } = useUser();
  const queryClient = useQueryClient();
  const toast = useShowToast();

  const {
    register,
    handleSubmit,
    reset,
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

  const fullName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
    : "";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your personal information"
        breadcrumbs={[
          { label: "Dashboard", href: ROUTES.DASHBOARD },
          { label: "Profile" },
        ]}
      />

      <div className="max-w-2xl space-y-6">
        {/* Profile Header */}
        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Avatar name={fullName || user?.email} size="xl" />
              <div>
                <h2 className="text-xl font-semibold">
                  {fullName || user?.email?.split("@")[0]}
                </h2>
                <p className="text-muted-foreground">{user?.email}</p>
                <Badge variant="secondary" className="mt-2">
                  {profile?.user_type ? USER_TYPE_LABELS[profile.user_type] : "User"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        {isLoading ? (
          <SkeletonCard />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card variant="bordered">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  error={errors.title?.message}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    {...register("phone")}
                    label="Phone"
                    placeholder="(555) 123-4567"
                    leftIcon={<Phone className="h-4 w-4" />}
                    error={errors.phone?.message}
                  />
                  <Input
                    {...register("location")}
                    label="Location"
                    placeholder="New York, NY"
                    leftIcon={<MapPin className="h-4 w-4" />}
                    error={errors.location?.message}
                  />
                </div>

                <Textarea
                  {...register("bio")}
                  label="Bio"
                  placeholder="Tell us about yourself and your experience..."
                  rows={4}
                  error={errors.bio?.message}
                />
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end mt-6">
              <Button
                type="submit"
                isLoading={isPending}
                disabled={!isDirty}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
