-- Drop indexes
DROP INDEX IF EXISTS idx_ai_traces_workspace_time;
DROP INDEX IF EXISTS idx_audit_entity;
DROP INDEX IF EXISTS idx_audit_workspace_time;
DROP INDEX IF EXISTS idx_attachment_ocr_attachment;
DROP INDEX IF EXISTS idx_attachments_transaction;
DROP INDEX IF EXISTS idx_contacts_workspace_name;
DROP INDEX IF EXISTS idx_contacts_workspace_type;
DROP INDEX IF EXISTS idx_tags_workspace_name;
DROP INDEX IF EXISTS idx_workspace_members_workspace;
DROP INDEX IF EXISTS idx_workspace_members_user;
DROP INDEX IF EXISTS idx_transactions_created_by;
DROP INDEX IF EXISTS idx_transactions_wallet_date;
DROP INDEX IF EXISTS idx_transactions_workspace_date;
DROP INDEX IF EXISTS idx_ledger_transfer_group;
DROP INDEX IF EXISTS idx_ledger_transaction;
DROP INDEX IF EXISTS idx_ledger_workspace;
DROP INDEX IF EXISTS idx_ledger_wallet_date;


-- Drop tables
-- Drop ai traces table
DROP TABLE IF EXISTS public.ai_traces;

-- Drop audit logs table
DROP TABLE IF EXISTS public.audit_logs;

-- Drop transaction items table
DROP TABLE IF EXISTS public.transaction_items;

-- Drop attachment ocr table
DROP TABLE IF EXISTS public.attachment_ocr;

-- Drop attachments table
DROP TABLE IF EXISTS public.attachments;

-- Drop transaction_tags table
DROP TABLE IF EXISTS public.transaction_tags;

-- Drop ledger_entries table
DROP TABLE IF EXISTS public.ledger_entries;

-- Drop transactions table
DROP TABLE IF EXISTS public.transactions;

-- Drop contacts table
DROP TABLE IF EXISTS public.contacts;

-- Drop tags table
DROP TABLE IF EXISTS public.tags;

-- Drop wallets table
DROP TABLE IF EXISTS public.wallets;

-- Drop wallet types table
DROP TABLE IF EXISTS public.wallet_types;

-- Drop workspace_invitations table
DROP TABLE IF EXISTS public.invitations;

-- Drop workspace_members table
DROP TABLE IF EXISTS public.workspace_members;

-- Drop workspaces table
DROP TABLE IF EXISTS public.workspaces;

-- Drop auth identities table
DROP TABLE IF EXISTS public.auth_identities;

-- Drop users table
DROP TABLE IF EXISTS public.users;