-- Create extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    profile_picture_url TEXT,
    is_active BOOLEAN DEFAULT FALSE,
    role VARCHAR(30) DEFAULT 'user' CHECK (role IN ('super_admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create auth_identities table
CREATE TABLE IF NOT EXISTS public.auth_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    password_hash VARCHAR(255),
    refresh_token_hash VARCHAR(255),
    auth_provider VARCHAR(30) NOT NULL CHECK (auth_provider IN ('email', 'google', 'facebook', 'twitter', 'apple')),
    auth_provider_user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (auth_provider, auth_provider_user_id),
    CHECK (
        (auth_provider = 'email' AND password_hash IS NOT NULL) OR
        (auth_provider != 'email' AND password_hash IS NULL)
    )
);

-- Create workspaces table
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(30) NOT NULL CHECK (type IN ('personal', 'family', 'team')),
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create workspace_members table
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(30) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (workspace_id, user_id)
);

-- Create invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(30) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    invited_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (workspace_id, email)
);

-- Create wallet types table
CREATE TABLE IF NOT EXISTS public.wallet_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create wallets table
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    currency VARCHAR(10) NOT NULL,
    type_id UUID REFERENCES public.wallet_types(id) ON DELETE SET NULL,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (workspace_id, name)
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('lender', 'employee', 'client', 'vendor', 'other')),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount NUMERIC(20, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense', 'transfer-in', 'transfer-out', 'investment', 'other')),
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create ledger entries table
CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount NUMERIC(20, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL,
    description TEXT,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('credit', 'debit')),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    transfer_group_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create transaction_tags table
CREATE TABLE IF NOT EXISTS public.transaction_tags (
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (transaction_id, tag_id)
);

-- Create attachments table
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create attachment ocr table
CREATE TABLE IF NOT EXISTS public.attachment_ocr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attachment_id UUID NOT NULL REFERENCES public.attachments(id) ON DELETE CASCADE,
    raw_text TEXT,
    language VARCHAR(10),
    extracted_data JSONB,
    confidence_score NUMERIC(5, 2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
    model_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create transaction items table
CREATE TABLE IF NOT EXISTS public.transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    quantity NUMERIC(20, 2) DEFAULT 1 CHECK (quantity > 0),
    price NUMERIC(20, 2) NOT NULL CHECK (price > 0),
    total NUMERIC(20, 2) GENERATED ALWAYS AS (quantity * price) STORED,
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity VARCHAR(255) NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create ai traces table
CREATE TABLE IF NOT EXISTS public.ai_traces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    input JSONB NOT NULL,
    output JSONB,
    model_version VARCHAR(50),
    input_tokens INTEGER,
    output_tokens INTEGER,
    latency_ms NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance optimization

-- Ledger entries indexes:

-- Why: 
-- Wallet balance computation
-- Monthly summaries
-- Timeline charts
CREATE INDEX IF NOT EXISTS idx_ledger_wallet_date ON public.ledger_entries (wallet_id, date DESC);

-- Why:
-- All dashboards are workspace-scoped
-- AI queries filter by workspace
CREATE INDEX IF NOT EXISTS idx_ledger_workspace ON public.ledger_entries (workspace_id);

-- Why:
-- Reverse lookup:
-- “Which ledger entries belong to this transaction?”
-- Audit + debugging + AI explanations
CREATE INDEX IF NOT EXISTS idx_ledger_transaction ON public.ledger_entries (transaction_id);

-- Why:
-- Transfer pairing validation
-- Reconstructing transfers
-- Detecting inconsistencies
CREATE INDEX IF NOT EXISTS idx_ledger_transfer_group ON public.ledger_entries (transfer_group_id);

-- Transaction Indexes:

-- Why:
-- Main UI feed (expense list)
-- Monthly filtering
-- Dashboard charts
CREATE INDEX IF NOT EXISTS idx_transactions_workspace_date ON public.transactions (workspace_id, date DESC);

-- Why:
-- Wallet-specific history view
-- Balance breakdown per wallet
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_date ON public.transactions (wallet_id, date DESC);

-- Why:
-- User activity tracking
-- Audit queries
-- “My transactions” filter
CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON public.transactions (created_by);

-- Indexes for workspace members and invitations:
-- Why:
-- Login → fetch all workspaces for user
-- Permission checks (VERY frequent)
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON public.workspace_members (user_id);

-- Why:
-- Workspace dashboard load
-- Member listing
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON public.workspace_members (workspace_id);


-- Indexes for tags: Filtering and Analytics
-- Why:
-- Fast tag search
-- Auto-suggestions in UI
-- Filtering transactions by tag
CREATE INDEX IF NOT EXISTS idx_tags_workspace_name ON public.tags (workspace_id, name);

-- Indexes for the contacts: Search and Filtering
-- Why:
-- Filter vendors/customers
-- Analytics by contact type
CREATE INDEX IF NOT EXISTS idx_contacts_workspace_type ON public.contacts (workspace_id, type);

-- Why:
-- Search bar ("find vendor X")
-- Autocomplete
CREATE INDEX IF NOT EXISTS idx_contacts_workspace_name ON public.contacts (workspace_id, name);

-- Indexes for the OCR
-- Why:
-- Load receipts per transaction
-- UI expansion
CREATE INDEX IF NOT EXISTS idx_attachments_transaction ON public.attachments (transaction_id);

-- Why:
-- OCR lookup per file
-- AI reprocessing pipeline
CREATE INDEX IF NOT EXISTS idx_attachment_ocr_attachment ON public.attachment_ocr (attachment_id);


-- Indexes for audit logs
-- Why:
-- Admin dashboard timeline
-- Debug history per workspace
CREATE INDEX IF NOT EXISTS idx_audit_workspace_time ON public.audit_logs (workspace_id, created_at DESC);

-- Why:
-- “Who changed this transaction?”
-- Debugging + traceability
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_logs (entity, entity_id);

-- Indexes for AI traces
-- Why:
-- AI usage analytics
-- Cost tracking per workspace
CREATE INDEX IF NOT EXISTS idx_ai_traces_workspace_time ON public.ai_traces (workspace_id, created_at DESC);