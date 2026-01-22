"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignUp } from "@/hooks/useAuth";
import { signupSchema, type SignupFormData } from "@/types/forms";
import { Button, Input, Select, Checkbox } from "@/components/ui";
import { ROUTES } from "@/lib/constants/routes";
import { USER_TYPE_LABELS } from "@/lib/constants/statuses";
import { Mail, Lock, User, Building, AlertCircle } from "lucide-react";

export default function SignupPage() {
  const { mutate: signUp, isPending, error } = useSignUp();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      user_type: undefined,
      company_name: "",
      first_name: "",
      last_name: "",
      terms: false,
    },
  });

  const selectedUserType = watch("user_type");

  const onSubmit = (data: SignupFormData) => {
    signUp({
      email: data.email,
      password: data.password,
      userType: data.user_type,
      firstName: data.first_name,
      lastName: data.last_name,
      companyName: data.company_name,
    });
  };

  const userTypeOptions = [
    {
      value: "gc",
      label: USER_TYPE_LABELS.gc,
    },
    {
      value: "sub",
      label: USER_TYPE_LABELS.sub,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Mobile Logo */}
      <div className="lg:hidden text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <svg
              className="h-6 w-6 text-primary-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <span className="text-xl font-bold">BlueprintX</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-2xl font-bold text-foreground">Create an account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Join BlueprintX to manage your construction projects
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error.message || "Failed to create account"}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role Selection */}
        <Select
          {...register("user_type")}
          label="I am a..."
          placeholder="Select your role"
          options={userTypeOptions}
          error={errors.user_type?.message}
          required
        />

        {/* Role Description */}
        {selectedUserType && (
          <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            {selectedUserType === "gc" ? (
              <p>
                As a <strong>General Contractor</strong>, you can create projects,
                upload blueprints, send tenders, and manage subcontractors.
              </p>
            ) : (
              <p>
                As a <strong>Subcontractor</strong>, you can browse available
                tenders, submit bids, and track your projects.
              </p>
            )}
          </div>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            {...register("first_name")}
            label="First Name"
            placeholder="John"
            leftIcon={<User className="h-4 w-4" />}
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

        {/* Company Name */}
        <Input
          {...register("company_name")}
          label="Company Name"
          placeholder="Acme Construction Inc."
          leftIcon={<Building className="h-4 w-4" />}
          hint="Optional"
        />

        {/* Email */}
        <Input
          {...register("email")}
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          required
        />

        {/* Password */}
        <Input
          {...register("password")}
          type={showPassword ? "text" : "password"}
          label="Password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          hint="At least 8 characters with uppercase, lowercase, and number"
          required
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          }
        />

        {/* Confirm Password */}
        <Input
          {...register("confirmPassword")}
          type={showPassword ? "text" : "password"}
          label="Confirm Password"
          placeholder="Confirm your password"
          autoComplete="new-password"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.confirmPassword?.message}
          required
        />

        {/* Terms */}
        <Checkbox
          {...register("terms")}
          label={
            <span>
              I agree to the{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </span>
          }
          error={errors.terms?.message}
        />

        <Button type="submit" className="w-full" isLoading={isPending}>
          Create Account
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Already have an account?
          </span>
        </div>
      </div>

      {/* Sign In Link */}
      <div className="text-center">
        <Link href={ROUTES.LOGIN}>
          <Button variant="outline" className="w-full">
            Sign in instead
          </Button>
        </Link>
      </div>
    </div>
  );
}
