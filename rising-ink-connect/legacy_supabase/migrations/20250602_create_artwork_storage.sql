
-- Create artwork-images bucket for storing portfolio artwork
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'artwork-images', 
  'artwork-images', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for artwork-images bucket
CREATE POLICY "Anyone can view artwork images" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'artwork-images');

CREATE POLICY "Artists can upload artwork images" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'artwork-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Artists can update their artwork images" 
  ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'artwork-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Artists can delete their artwork images" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'artwork-images' 
    AND auth.role() = 'authenticated'
  );
