-- ==============================================================================
-- MIOS Migration 009: Creative Assets Storage Bucket & RLS Policies
-- Idempotent setup for the 'creatives' Supabase Storage bucket (50MB limit,
-- image & video MIME types) and public read / authenticated write RLS policies.
-- ==============================================================================

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'storage' AND table_name = 'buckets'
  ) THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'creatives',
      'creatives',
      true,
      52428800,
      ARRAY[
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/gif',
        'video/mp4',
        'video/webm',
        'video/quicktime'
      ]
    )
    ON CONFLICT (id) DO UPDATE SET
      public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'storage' AND table_name = 'objects'
  ) THEN
    DROP POLICY IF EXISTS "Public read access for creative assets" ON storage.objects;
    CREATE POLICY "Public read access for creative assets"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'creatives');

    DROP POLICY IF EXISTS "Authenticated users can upload creative assets" ON storage.objects;
    CREATE POLICY "Authenticated users can upload creative assets"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'creatives');

    DROP POLICY IF EXISTS "Authenticated users can update creative assets" ON storage.objects;
    CREATE POLICY "Authenticated users can update creative assets"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'creatives')
      WITH CHECK (bucket_id = 'creatives');

    DROP POLICY IF EXISTS "Authenticated users can delete creative assets" ON storage.objects;
    CREATE POLICY "Authenticated users can delete creative assets"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'creatives');
  END IF;
END $$;
