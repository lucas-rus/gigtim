-- Migration 012: Expand worker_skill enum with legal casual & household roles
-- Adds Peisagistică/Tuns Iarba, Menaj/Curățenie, Evenimente/Hostess, Pet Care, Promoter, Ajutor Bucătar

DO $$
BEGIN
  ALTER TYPE worker_skill ADD VALUE IF NOT EXISTS 'KITCHEN_HELP';
  ALTER TYPE worker_skill ADD VALUE IF NOT EXISTS 'EVENT_CREW';
  ALTER TYPE worker_skill ADD VALUE IF NOT EXISTS 'GARDENER';
  ALTER TYPE worker_skill ADD VALUE IF NOT EXISTS 'CLEANER';
  ALTER TYPE worker_skill ADD VALUE IF NOT EXISTS 'PET_SITTER';
  ALTER TYPE worker_skill ADD VALUE IF NOT EXISTS 'PROMOTER';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
