"use client";

import { cn } from "@/lib/utils/cn";

interface IllustrationProps {
  className?: string;
}

// Blueprint/No Projects Illustration
export function BlueprintIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-48 h-auto", className)}
    >
      {/* Blueprint paper background */}
      <rect
        x="20"
        y="20"
        width="160"
        height="120"
        rx="4"
        className="fill-blueprint/10 stroke-blueprint/30"
        strokeWidth="2"
        strokeDasharray="8 4"
      />

      {/* Grid lines */}
      <g className="stroke-blueprint/20" strokeWidth="0.5">
        {[40, 60, 80, 100, 120].map((y) => (
          <line key={y} x1="30" y1={y} x2="170" y2={y} />
        ))}
        {[50, 80, 110, 140].map((x) => (
          <line key={x} x1={x} y1="30" x2={x} y2="130" />
        ))}
      </g>

      {/* Building outline */}
      <path
        d="M60 110 L60 60 L100 40 L140 60 L140 110 Z"
        className="stroke-blueprint fill-none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Windows */}
      <rect
        x="70"
        y="70"
        width="15"
        height="15"
        rx="1"
        className="stroke-blueprint/60 fill-blueprint/5"
        strokeWidth="1.5"
      />
      <rect
        x="115"
        y="70"
        width="15"
        height="15"
        rx="1"
        className="stroke-blueprint/60 fill-blueprint/5"
        strokeWidth="1.5"
      />

      {/* Door */}
      <rect
        x="90"
        y="85"
        width="20"
        height="25"
        rx="1"
        className="stroke-blueprint fill-blueprint/10"
        strokeWidth="2"
      />

      {/* Hard hat on top */}
      <ellipse
        cx="100"
        cy="35"
        rx="18"
        ry="8"
        className="fill-primary/20 stroke-primary"
        strokeWidth="2"
      />
      <path
        d="M82 35 Q82 28 100 25 Q118 28 118 35"
        className="fill-primary/30 stroke-primary"
        strokeWidth="2"
      />

      {/* Dotted lines suggesting measurement */}
      <line
        x1="45"
        y1="60"
        x2="45"
        y2="110"
        className="stroke-primary/40"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <line
        x1="42"
        y1="60"
        x2="48"
        y2="60"
        className="stroke-primary/40"
        strokeWidth="1"
      />
      <line
        x1="42"
        y1="110"
        x2="48"
        y2="110"
        className="stroke-primary/40"
        strokeWidth="1"
      />
    </svg>
  );
}

// Construction Crane Illustration (for loading states)
export function CraneIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-48 h-auto", className)}
    >
      {/* Ground */}
      <line
        x1="20"
        y1="140"
        x2="180"
        y2="140"
        className="stroke-steel-300"
        strokeWidth="2"
      />

      {/* Crane base */}
      <rect
        x="50"
        y="120"
        width="40"
        height="20"
        rx="2"
        className="fill-steel-400"
      />

      {/* Crane tower */}
      <rect x="65" y="40" width="10" height="80" className="fill-steel-500" />

      {/* Crane arm */}
      <rect
        x="40"
        y="35"
        width="100"
        height="8"
        rx="2"
        className="fill-primary"
      />

      {/* Crane hook cable */}
      <line
        x1="120"
        y1="43"
        x2="120"
        y2="90"
        className="stroke-steel-400"
        strokeWidth="2"
      />

      {/* Hook */}
      <path
        d="M115 90 L120 90 L120 100 Q120 108 115 108 Q110 108 110 102 L110 98"
        className="stroke-primary fill-none"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Lifting block */}
      <rect
        x="105"
        y="100"
        width="30"
        height="25"
        rx="2"
        className="fill-primary/20 stroke-primary"
        strokeWidth="2"
      />

      {/* Counter weight */}
      <rect
        x="45"
        y="25"
        width="15"
        height="15"
        rx="1"
        className="fill-steel-600"
      />

      {/* Operator cabin */}
      <rect
        x="60"
        y="45"
        width="20"
        height="15"
        rx="2"
        className="fill-warning/30 stroke-warning"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// Clipboard/No Tenders Illustration
export function ClipboardIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-48 h-auto", className)}
    >
      {/* Clipboard body */}
      <rect
        x="50"
        y="30"
        width="100"
        height="120"
        rx="6"
        className="fill-steel-100 stroke-steel-300"
        strokeWidth="2"
      />

      {/* Clipboard clip */}
      <rect
        x="75"
        y="20"
        width="50"
        height="20"
        rx="3"
        className="fill-steel-400"
      />
      <rect
        x="85"
        y="25"
        width="30"
        height="10"
        rx="2"
        className="fill-steel-200"
      />

      {/* Checklist lines */}
      <g className="stroke-steel-300" strokeWidth="1.5">
        <line x1="65" y1="60" x2="135" y2="60" />
        <line x1="65" y1="80" x2="135" y2="80" />
        <line x1="65" y1="100" x2="135" y2="100" />
        <line x1="65" y1="120" x2="100" y2="120" strokeDasharray="4 2" />
      </g>

      {/* Checkmarks */}
      <path
        d="M70 55 L75 60 L85 50"
        className="stroke-success fill-none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M70 75 L75 80 L85 70"
        className="stroke-success fill-none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Empty checkbox */}
      <rect
        x="68"
        y="92"
        width="12"
        height="12"
        rx="2"
        className="stroke-steel-400 fill-none"
        strokeWidth="1.5"
      />

      {/* Pencil */}
      <g transform="translate(140, 110) rotate(-45)">
        <rect x="0" y="0" width="8" height="40" className="fill-warning" />
        <polygon points="0,40 4,50 8,40" className="fill-steel-600" />
        <rect x="0" y="0" width="8" height="6" className="fill-primary" />
      </g>
    </svg>
  );
}

// Gavel/No Bids Illustration
export function GavelIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-48 h-auto", className)}
    >
      {/* Base/Sound block */}
      <ellipse cx="100" cy="130" rx="45" ry="10" className="fill-steel-300" />
      <rect
        x="55"
        y="110"
        width="90"
        height="20"
        rx="4"
        className="fill-steel-400"
      />

      {/* Gavel handle */}
      <rect
        x="95"
        y="45"
        width="10"
        height="60"
        rx="2"
        className="fill-amber-600"
        transform="rotate(-30 100 75)"
      />

      {/* Gavel head */}
      <rect
        x="70"
        y="20"
        width="60"
        height="25"
        rx="4"
        className="fill-steel-600"
        transform="rotate(-30 100 32)"
      />

      {/* Blueprint paper under */}
      <g transform="translate(20, 85) rotate(-5)">
        <rect
          width="70"
          height="50"
          rx="2"
          className="fill-blueprint/10 stroke-blueprint/30"
          strokeWidth="1"
          strokeDasharray="4 2"
        />
        <line
          x1="10"
          y1="15"
          x2="60"
          y2="15"
          className="stroke-blueprint/30"
          strokeWidth="1"
        />
        <line
          x1="10"
          y1="25"
          x2="50"
          y2="25"
          className="stroke-blueprint/30"
          strokeWidth="1"
        />
        <line
          x1="10"
          y1="35"
          x2="55"
          y2="35"
          className="stroke-blueprint/30"
          strokeWidth="1"
        />
      </g>

      {/* Dollar signs */}
      <text x="145" y="60" className="fill-success/50 text-2xl font-bold">
        $
      </text>
      <text x="155" y="80" className="fill-success/30 text-lg font-bold">
        $
      </text>
    </svg>
  );
}

// Toolbox/No Tasks Illustration
export function ToolboxIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-48 h-auto", className)}
    >
      {/* Toolbox body */}
      <rect
        x="35"
        y="70"
        width="130"
        height="70"
        rx="6"
        className="fill-primary/20 stroke-primary"
        strokeWidth="2"
      />

      {/* Toolbox lid */}
      <rect
        x="30"
        y="55"
        width="140"
        height="20"
        rx="4"
        className="fill-primary stroke-primary-deep"
        strokeWidth="2"
      />

      {/* Handle */}
      <rect
        x="80"
        y="40"
        width="40"
        height="10"
        rx="3"
        className="fill-steel-500"
      />
      <rect
        x="90"
        y="35"
        width="20"
        height="8"
        rx="2"
        className="fill-steel-400"
      />

      {/* Latch */}
      <rect
        x="95"
        y="68"
        width="10"
        height="12"
        rx="2"
        className="fill-steel-400"
      />

      {/* Tools peeking out */}
      {/* Wrench */}
      <g transform="translate(50, 85)">
        <rect
          x="0"
          y="0"
          width="6"
          height="35"
          rx="2"
          className="fill-steel-500"
        />
        <circle
          cx="3"
          cy="5"
          r="6"
          className="fill-steel-400 stroke-steel-500"
          strokeWidth="2"
        />
      </g>

      {/* Screwdriver */}
      <g transform="translate(80, 90)">
        <rect x="0" y="0" width="5" height="25" className="fill-steel-400" />
        <rect
          x="-2"
          y="25"
          width="9"
          height="12"
          rx="2"
          className="fill-warning"
        />
      </g>

      {/* Hammer */}
      <g transform="translate(110, 82)">
        <rect x="2" y="0" width="4" height="30" className="fill-amber-600" />
        <rect
          x="-5"
          y="-5"
          width="18"
          height="10"
          rx="2"
          className="fill-steel-600"
        />
      </g>

      {/* Checkmarks floating */}
      <path
        d="M160 45 L165 50 L175 40"
        className="stroke-success fill-none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M25 90 L30 95 L40 85"
        className="stroke-success/50 fill-none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Workers/No Subcontractors Illustration
export function WorkersIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-48 h-auto", className)}
    >
      {/* Ground */}
      <line
        x1="20"
        y1="140"
        x2="180"
        y2="140"
        className="stroke-steel-300"
        strokeWidth="2"
      />

      {/* Worker 1 (left) */}
      <g transform="translate(45, 50)">
        {/* Hard hat */}
        <ellipse cx="20" cy="10" rx="15" ry="6" className="fill-warning" />
        <path
          d="M5 10 Q5 0 20 0 Q35 0 35 10"
          className="fill-warning stroke-warning"
          strokeWidth="1"
        />
        {/* Head */}
        <circle
          cx="20"
          cy="20"
          r="12"
          className="fill-amber-100 stroke-steel-400"
          strokeWidth="1"
        />
        {/* Body */}
        <rect
          x="8"
          y="32"
          width="24"
          height="35"
          rx="4"
          className="fill-primary"
        />
        {/* Legs */}
        <rect
          x="10"
          y="67"
          width="8"
          height="25"
          rx="2"
          className="fill-steel-600"
        />
        <rect
          x="22"
          y="67"
          width="8"
          height="25"
          rx="2"
          className="fill-steel-600"
        />
      </g>

      {/* Worker 2 (center) */}
      <g transform="translate(85, 45)">
        {/* Hard hat */}
        <ellipse cx="20" cy="10" rx="15" ry="6" className="fill-primary" />
        <path
          d="M5 10 Q5 0 20 0 Q35 0 35 10"
          className="fill-primary stroke-primary"
          strokeWidth="1"
        />
        {/* Head */}
        <circle
          cx="20"
          cy="20"
          r="12"
          className="fill-amber-100 stroke-steel-400"
          strokeWidth="1"
        />
        {/* Body */}
        <rect
          x="8"
          y="32"
          width="24"
          height="38"
          rx="4"
          className="fill-warning"
        />
        {/* Legs */}
        <rect
          x="10"
          y="70"
          width="8"
          height="27"
          rx="2"
          className="fill-steel-600"
        />
        <rect
          x="22"
          y="70"
          width="8"
          height="27"
          rx="2"
          className="fill-steel-600"
        />
      </g>

      {/* Worker 3 (right) */}
      <g transform="translate(130, 55)">
        {/* Hard hat */}
        <ellipse cx="20" cy="10" rx="15" ry="6" className="fill-success" />
        <path
          d="M5 10 Q5 0 20 0 Q35 0 35 10"
          className="fill-success stroke-success"
          strokeWidth="1"
        />
        {/* Head */}
        <circle
          cx="20"
          cy="20"
          r="12"
          className="fill-amber-100 stroke-steel-400"
          strokeWidth="1"
        />
        {/* Body */}
        <rect
          x="8"
          y="32"
          width="24"
          height="32"
          rx="4"
          className="fill-info"
        />
        {/* Legs */}
        <rect
          x="10"
          y="64"
          width="8"
          height="22"
          rx="2"
          className="fill-steel-600"
        />
        <rect
          x="22"
          y="64"
          width="8"
          height="22"
          rx="2"
          className="fill-steel-600"
        />
      </g>

      {/* Connection lines (network) */}
      <line
        x1="65"
        y1="70"
        x2="105"
        y2="65"
        className="stroke-primary/30"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <line
        x1="125"
        y1="65"
        x2="150"
        y2="75"
        className="stroke-primary/30"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <line
        x1="65"
        y1="85"
        x2="150"
        y2="90"
        className="stroke-primary/20"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
    </svg>
  );
}

// Traffic Cone/Error Illustration
export function ErrorIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-48 h-auto", className)}
    >
      {/* Ground */}
      <ellipse cx="100" cy="140" rx="50" ry="8" className="fill-steel-200" />

      {/* Traffic cone */}
      <path d="M75 135 L90 50 L110 50 L125 135 Z" className="fill-primary" />

      {/* White stripes */}
      <rect
        x="80"
        y="70"
        width="40"
        height="12"
        className="fill-white"
        transform="rotate(0 100 76)"
      />
      <rect x="77" y="100" width="46" height="12" className="fill-white" />

      {/* Cone base */}
      <rect
        x="65"
        y="130"
        width="70"
        height="10"
        rx="2"
        className="fill-steel-700"
      />

      {/* Warning sign */}
      <g transform="translate(130, 40)">
        <polygon
          points="25,0 50,45 0,45"
          className="fill-warning stroke-steel-700"
          strokeWidth="2"
        />
        <text
          x="25"
          y="35"
          textAnchor="middle"
          className="fill-steel-800 text-2xl font-bold"
        >
          !
        </text>
      </g>

      {/* X marks */}
      <g className="stroke-error" strokeWidth="3" strokeLinecap="round">
        <line x1="35" y1="60" x2="45" y2="70" />
        <line x1="45" y1="60" x2="35" y2="70" />
      </g>
      <g className="stroke-error/50" strokeWidth="2" strokeLinecap="round">
        <line x1="155" y1="100" x2="165" y2="110" />
        <line x1="165" y1="100" x2="155" y2="110" />
      </g>
    </svg>
  );
}

// Empty Search Illustration
export function SearchEmptyIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-48 h-auto", className)}
    >
      {/* Magnifying glass */}
      <circle
        cx="85"
        cy="70"
        r="40"
        className="fill-steel-100 stroke-steel-400"
        strokeWidth="3"
      />
      <circle
        cx="85"
        cy="70"
        r="30"
        className="fill-white stroke-steel-300"
        strokeWidth="2"
      />

      {/* Handle */}
      <rect
        x="115"
        y="100"
        width="50"
        height="14"
        rx="7"
        className="fill-steel-500"
        transform="rotate(45 115 107)"
      />

      {/* Question mark in lens */}
      <text
        x="85"
        y="80"
        textAnchor="middle"
        className="fill-steel-400 text-3xl font-bold"
      >
        ?
      </text>

      {/* Dotted search paths */}
      <path
        d="M35 30 Q50 50 45 70"
        className="stroke-primary/30 fill-none"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <path
        d="M150 40 Q130 55 125 70"
        className="stroke-primary/30 fill-none"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <path
        d="M60 130 Q70 110 80 100"
        className="stroke-primary/30 fill-none"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />

      {/* Small decorative elements */}
      <circle cx="30" cy="25" r="4" className="fill-primary/20" />
      <circle cx="160" cy="35" r="3" className="fill-primary/30" />
      <circle cx="50" cy="135" r="5" className="fill-primary/15" />
    </svg>
  );
}
