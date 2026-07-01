ALTER TABLE public.invitations
DROP CONSTRAINT IF EXISTS invitations_workspace_id_email_key;

ALTER TABLE public.invitations
ADD CONSTRAINT invitations_workspace_id_email_key
UNIQUE (workspace_id, email);