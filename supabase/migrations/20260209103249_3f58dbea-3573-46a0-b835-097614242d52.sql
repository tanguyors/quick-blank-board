-- Fix property media URLs: convert absolute preview URLs to relative paths
UPDATE property_media
SET url = regexp_replace(url, '^https?://[^/]+/', '/')
WHERE url LIKE 'https://id-preview--%/properties/%';