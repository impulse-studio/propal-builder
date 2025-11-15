# Propal Builder

Commercial proposals builder with AI-powered editing capabilities, voice transcription, and vector search integration.

## 📋 Overview

This repository contains the **platform component** of the Propal Builder system. It provides the web interface for creating, editing, and managing commercial proposals with AI assistance.

The complete Propal Builder ecosystem consists of two main parts:

1. **Platform (this repository)**: Next.js web application with AI-powered editing, voice transcription, and proposal management
   
2. **Automation Pipeline**: Built with [n8n](https://n8n.io/) and [Qdrant](https://qdrant.tech/)
   - Handles automated data ingestion and processing
   - Manages vector embeddings for semantic search
   - Syncs client information and proposal data
   - Orchestrates background workflows and integrations

The platform communicates with the automation pipeline through Qdrant's vector database for client information retrieval and similarity matching.


## 🚀 Tech Stack

This project leverages a modern stack of cutting-edge tools and libraries:

### Core Framework
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development

### AI & Machine Learning
- **[Vercel AI SDK](https://sdk.vercel.ai/)** (`@ai-sdk/react`, `@ai-sdk/google) 
  - AI integration for chat and streaming
  - Used for AI-powered proposal editing with tool calling
  - Supports Google Gemini 2.5 Pro and OpenAI models
  - Enables streaming responses and tool execution
- **[Eleven Labs](https://elevenlabs.io/)** (`@elevenlabs/client`, `@elevenlabs/react`)
  - **Speech-to-Text (STT)**: Real-time audio transcription using Scribe v1 model
  - **Voice Features**: Real-time voice interactions and audio processing
  - Used in `/api/scribe-token` and `/server/routers/stt` for audio transcription

### Vector Database
- **[Qdrant](https://qdrant.tech/)** (`@qdrant/js-client-rest`) - Vector similarity search
  - Used for client information storage and similarity matching
  - Enables semantic search capabilities
  - Configured in `lib/qdrant/client.ts`

### API & Backend
- **[oRPC](https://orpc.dev/)** (`@orpc/server`, `@orpc/client`, `@orpc/tanstack-query`) - Type-safe RPC framework
  - Replaces traditional REST/GraphQL with type-safe RPC calls
  - Integrated with TanStack Query for client-side data fetching
  - Server routers in `server/routers/` (chat, propal, stt)
- **[Trigger.dev Workflows](https://trigger.dev/)** (`workflow`) - Background job processing
  - Used for async workflows (e.g., `create-propal-workflow.ts`)
  - Handles long-running tasks and background processing

### Database & ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database
- **[Drizzle ORM](https://orm.drizzle.team/)** (`drizzle-orm`, `drizzle-kit`) - Type-safe SQL ORM
  - Schema definitions in `db/schema/`
  - Migrations managed with Drizzle Kit

### Rich Text Editing
- **[TipTap](https://tiptap.dev/)** (`@tiptap/*`) - Headless rich text editor
  - Custom extensions for proposal editing
  - Slash commands and custom blocks (pricing cards, feature lists, CTAs)
  - Image upload integration with Vercel Blob

### File Storage
- **[Vercel Blob](https://vercel.com/docs/storage/vercel-blob)** (`@vercel/blob`) - File storage service
  - Handles image and file uploads
  - Used in editor image uploads and form file uploads
  - API route: `/api/upload/editor-images`

### UI Components & Styling
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Motion](https://motion.dev/)** (`motion`) - Animation library
- **[React Hook Form](https://react-hook-form.com/)** - Form state management
- **[Zod](https://zod.dev/)** - Schema validation

### Development Tools
- **[Biome](https://biomejs.dev/)** - Fast linter and formatter
- **[TanStack Query](https://tanstack.com/query)** - Data fetching and caching
- **[nuqs](https://nuqs.vercel.app/)** - Type-safe URL search params

## 📋 Prerequisites

- **Node.js** 20+ and **pnpm** (package manager)
- **Docker** and **Docker Compose** (for local PostgreSQL)
- **PostgreSQL** 17+ (via Docker or local installation)
- API keys for:
  - Eleven Labs (required)
  - Qdrant (optional, for vector search)
  - Attio (optional, for CRM integration)
  - Vercel Blob (required for file uploads)

## 🛠️ Setup & Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd propal-builder
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Variables

Copy the example environment file and configure your variables:

```bash
cp env.example .env
```

Edit `.env` and add your API keys

### 4. Start Docker Compose

Start the PostgreSQL database:

```bash
docker compose up -d
```

This will start PostgreSQL on port `5555` with:
- Database: `db`
- User: `postgres`
- Password: `postgres`

### 5. Available Scripts

Check the `package.json` file for all available scripts. Here are the main ones:

- **Development**: `pnpm dev` - Start Next.js dev server
- **Database**: `pnpm db:migrate`, `pnpm db:push`, `pnpm db:studio`, `pnpm db:start`, `pnpm db:stop`
- **Code Quality**: `pnpm lint`, `pnpm format`, `pnpm typecheck`, `pnpm checks`
- **Trigger.dev**: `pnpm trigger:deploy`, `pnpm trigger:webhook`

See the [Development Scripts](#-development-scripts) section below for a complete list.

## 📁 Project Structure

```
propal-builder/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── rpc/                  # oRPC endpoint
│   │   ├── scribe-token/         # Eleven Labs token endpoint
│   │   └── upload/               # File upload endpoints
│   ├── dashboard/                # Dashboard pages
│   │   └── propal/[id]/          # Proposal editor pages
│   ├── _components/              # App-level components
│   └── workflows/                # Trigger.dev workflows
├── components/                    # Shared React components
│   ├── ai/                       # AI-related components
│   ├── custom/                   # Custom components
│   ├── form/                     # Form components
│   └── ui/                       # UI primitives
├── db/                           # Database schema
│   └── schema/                   # Drizzle schemas
├── lib/                          # Utility libraries
│   ├── qdrant/                   # Qdrant client
│   └── utils/                    # Helper functions
├── orpc/                         # oRPC client configuration
├── server/                       # Server-side code
│   ├── routers/                  # oRPC routers
│   │   ├── chat/                 # Chat router
│   │   ├── propal/               # Proposal router
│   │   └── stt/                  # Speech-to-text router
│   └── context.ts                # Server context
├── docker-compose.yml            # PostgreSQL Docker setup
├── drizzle.config.ts             # Drizzle configuration
└── env.ts                        # Environment validation
```


## 🗄️ Database Management

### Generate Migrations

After modifying schema files:

```bash
pnpm db:generate
```

### Run Migrations

```bash
pnpm db:migrate
```

### Open Drizzle Studio

Visual database browser:

```bash
pnpm db:studio
```

### Database Connection

Connect directly to PostgreSQL:

```bash
psql -h localhost -p 5555 -U postgres -d db
```

## 🧪 Development Scripts

```bash
# Development
pnpm dev              # Start Next.js dev server
pnpm db:start         # Start PostgreSQL with Docker
pnpm db:stop          # Stop PostgreSQL

# Database
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema (dev only)
pnpm db:studio        # Open Drizzle Studio

# Code Quality
pnpm lint             # Run Biome linter
pnpm format           # Format code with Biome
pnpm typecheck        # TypeScript type checking
pnpm checks           # Run lint + typecheck

# Trigger.dev
pnpm trigger:deploy   # Deploy Trigger.dev workflows
pnpm trigger:webhook  # Test webhook locally
```
