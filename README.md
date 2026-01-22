# BlueprintX

Construction project management platform with AI-powered document analysis. Built for General Contractors and Subcontractors to manage projects, tenders, bids, and team collaboration.

## Features

### Project Management
- Create and manage construction projects with status tracking
- Upload and organize project documents (blueprints, specs, contracts)
- Track project milestones, timelines, and estimated values
- Task management with assignees, priorities, and due dates

### Tender & Bid Management
- Create tenders with trade categories, scope of work, and bid deadlines
- Invite subcontractors to bid on specific tenders
- Track bid submissions, compare offers, and award contracts
- Full bid lifecycle management from draft to awarded

### RFI (Request for Information)
- Create and track RFIs across projects
- Priority-based assignment and response tracking
- Threaded responses with file attachments

### Subcontractor Management
- Browse and search verified subcontractors by trade
- Subcontractor profiles with ratings, reviews, and completed projects
- Manage your own subcontractor network with custom contacts
- Hire request workflow with messaging and negotiation

### Hiring & Contracts
- Send hire requests with proposed rates and timelines
- Real-time messaging between GCs and subs
- Contract generation from templates
- Digital signature workflow
- Team member management per project

### AI-Powered Features
- **Plan Summary**: Automatically extract building type, square footage, materials, and structural systems from uploaded documents
- **Trade Scope Extraction**: Identify CSI divisions, inclusions/exclusions, and required spec sections per trade
- **Tender Scope Document Generation**: Generate bid-ready scope documents for specific trades
- **RAG Q&A**: Ask questions about your project documents and get answers with citations

### Admin Panel
- User verification management
- Audit logging
- System-wide analytics

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4, Framer Motion
- **State**: TanStack React Query, Zustand
- **Forms**: React Hook Form, Zod validation
- **Auth**: Supabase
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 20+
- npm, yarn, or pnpm
- Running BlueprintX backend API

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/blueprintx-frontend.git
cd blueprintx-frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Configure your environment variables in .env.local
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Login, signup pages
│   ├── (dashboard)/       # Main app pages (projects, tenders, etc.)
│   └── providers.tsx      # React Query, auth providers
├── components/
│   ├── common/            # Shared components (EmptyState, Loading)
│   ├── features/          # Feature-specific components
│   ├── layout/            # Header, Sidebar, Navigation
│   └── ui/                # Design system (Button, Card, Modal, etc.)
├── hooks/                 # Custom React hooks
├── lib/
│   ├── api/              # API client functions
│   ├── constants/        # Routes, statuses, configuration
│   └── utils/            # Utility functions
└── types/                # TypeScript types and models
```

## User Types

- **General Contractor (GC)**: Full access to project creation, tender management, hiring workflow
- **Subcontractor (Sub)**: Access to marketplace, bid submission, hire request responses

## License

MIT
