import { HardHat } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar text-sidebar-foreground flex-col justify-between p-12">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <HardHat className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">BlueprintX</span>
          </Link>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Construction project management,
            <span className="text-primary"> simplified.</span>
          </h1>
          <p className="text-lg text-sidebar-foreground/80">
            Track projects from blueprint to completion. Manage tenders, hire
            subcontractors, and collaborate seamlessly with your team.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-sidebar-foreground/70">Active Projects</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">2,000+</div>
              <div className="text-sm text-sidebar-foreground/70">Contractors</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">$50M+</div>
              <div className="text-sm text-sidebar-foreground/70">Tender Value</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">98%</div>
              <div className="text-sm text-sidebar-foreground/70">Satisfaction</div>
            </div>
          </div>
        </div>

        <div className="text-sm text-sidebar-foreground/60">
          &copy; {new Date().getFullYear()} BlueprintX. All rights reserved.
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
