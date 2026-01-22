"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useUser } from "@/hooks/useAuth";
import { useUIStore } from "@/stores/ui-store";
import { ROUTES } from "@/lib/constants/routes";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Users,
  Gavel,
  CheckSquare,
  MessageSquare,
  Settings,
  X,
  HardHat,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: ("gc" | "sub")[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "Projects",
    href: ROUTES.PROJECTS,
    icon: <FolderKanban className="h-5 w-5" />,
  },
  {
    label: "Tenders",
    href: ROUTES.TENDERS,
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: "My Bids",
    href: ROUTES.BIDS,
    icon: <Gavel className="h-5 w-5" />,
    roles: ["sub"],
  },
  {
    label: "Subcontractors",
    href: ROUTES.SUBCONTRACTORS,
    icon: <Users className="h-5 w-5" />,
    roles: ["gc"],
  },
  {
    label: "Tasks",
    href: ROUTES.TASKS,
    icon: <CheckSquare className="h-5 w-5" />,
  },
  {
    label: "RFIs",
    href: ROUTES.RFIS,
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    label: "Settings",
    href: ROUTES.SETTINGS,
    icon: <Settings className="h-5 w-5" />,
  },
];

// Animation variants - using 'as const' to fix TypeScript inference
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
} as const;

const drawerVariants = {
  hidden: { x: "-100%" },
  visible: {
    x: 0,
    transition: {
      type: "spring" as const,
      damping: 30,
      stiffness: 300,
    },
  },
  exit: {
    x: "-100%",
    transition: {
      type: "spring" as const,
      damping: 30,
      stiffness: 300,
    },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05 + 0.1,
      duration: 0.3,
    },
  }),
};

export function MobileNav() {
  const pathname = usePathname();
  const { profile } = useUser();
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();

  const userType = profile?.user_type || "gc";

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userType),
  );

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  // Close menu on route change
  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay with blur */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />

          {/* Drawer - Glassmorphism */}
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "absolute left-0 top-0 h-full w-[280px]",
              // Glassmorphism background
              "bg-steel-900/95 dark:bg-steel-950/95",
              "backdrop-blur-xl",
              "border-r border-white/10",
              // Subtle gradient overlay
              "before:absolute before:inset-0 before:bg-gradient-to-b",
              "before:from-primary/5 before:via-transparent before:to-transparent",
              "before:pointer-events-none",
            )}
          >
            {/* Header */}
            <div className="relative flex h-[var(--header-height)] items-center justify-between px-4 border-b border-white/10">
              <Link
                href={ROUTES.DASHBOARD}
                className="flex items-center gap-3 group"
                onClick={closeMobileMenu}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl",
                    "bg-gradient-to-br from-primary to-primary-600",
                    "shadow-lg shadow-primary/30",
                  )}
                >
                  <HardHat className="h-5 w-5 text-white" />
                </motion.div>
                <span className="text-lg font-bold text-white tracking-tight">
                  BlueprintX
                </span>
              </Link>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeMobileMenu}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl",
                  "bg-white/10 hover:bg-white/20",
                  "text-white/70 hover:text-white",
                  "transition-colors duration-200",
                )}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Navigation */}
            <nav className="relative p-4 overflow-y-auto h-[calc(100%-var(--header-height))]">
              <ul className="space-y-1">
                {filteredNavItems.map((item, index) => {
                  const active = isActive(item.href);
                  return (
                    <motion.li
                      key={item.href}
                      custom={index}
                      variants={navItemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Link
                        href={item.href}
                        onClick={closeMobileMenu}
                        className={cn(
                          "relative flex items-center gap-3 rounded-xl px-4 py-3",
                          "transition-all duration-200",
                          "group",
                          active
                            ? cn(
                                // Active state - glowing primary
                                "bg-primary/20",
                                "text-white",
                                "shadow-lg shadow-primary/20",
                              )
                            : cn(
                                // Inactive state
                                "text-steel-300 hover:text-white",
                                "hover:bg-white/10",
                              ),
                        )}
                      >
                        {/* Active indicator glow */}
                        {active && (
                          <motion.div
                            layoutId="mobile-nav-active"
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/30 to-primary/10"
                            transition={{
                              type: "spring",
                              stiffness: 350,
                              damping: 30,
                            }}
                          />
                        )}

                        {/* Left accent bar for active */}
                        {active && (
                          <motion.div
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary shadow-lg shadow-primary/50"
                          />
                        )}

                        {/* Icon */}
                        <span
                          className={cn(
                            "relative flex-shrink-0 transition-transform duration-200",
                            active
                              ? "text-primary-400"
                              : "text-steel-400 group-hover:text-white",
                            "group-hover:scale-110",
                          )}
                        >
                          {item.icon}
                        </span>

                        {/* Label */}
                        <span
                          className={cn(
                            "relative font-medium transition-colors duration-200",
                            active && "font-semibold",
                          )}
                        >
                          {item.label}
                        </span>

                        {/* Chevron for active */}
                        {active && (
                          <ChevronRight className="ml-auto h-4 w-4 text-primary-400" />
                        )}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              {/* Footer - App Version */}
              <div className="mt-8 pt-4 border-t border-white/10">
                <div className="px-4 py-2">
                  <p className="text-xs text-steel-500 font-medium">
                    BlueprintX v1.0.0
                  </p>
                  <p className="text-xs text-steel-600 mt-1">
                    Construction Management
                  </p>
                </div>
              </div>
            </nav>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
