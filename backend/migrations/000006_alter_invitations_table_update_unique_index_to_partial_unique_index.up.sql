UPDATE public.invitations
SET status = 'expired'
WHERE status = 'pending'
  AND expires_at < NOW();


ALTER TABLE public.invitations
DROP CONSTRAINT IF EXISTS invitations_workspace_id_email_key;


CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_workspace_email_pending
ON public.invitations (workspace_id, email)
WHERE status = 'pending';
