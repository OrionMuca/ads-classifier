-- Truncate tables (in correct order due to foreign keys)
TRUNCATE TABLE "Post" CASCADE;
TRUNCATE TABLE "Category" CASCADE;
TRUNCATE TABLE "Ad" CASCADE;

-- Seed Admin User
-- Password: admin123
INSERT INTO "User" (id, email, password, name, phone, role, "createdAt", "updatedAt") VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@marketplace.com', '$2b$10$vdkEvVmigMzyI.OdEwHSCuSqQkFccYCAgx.VUsqsUOTYjGLjmIUqq', 'Admin User', '+355691234567', 'ADMIN', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Seed Categories (Hierarchical & UUIDs)
-- Main Categories - Using proper UUIDs
WITH main_categories AS (
  INSERT INTO "Category" (id, name, slug, icon, "createdAt", "updatedAt") VALUES
    (gen_random_uuid()::text, 'Elektronikë', 'elektronike', '📱', NOW(), NOW()),
    (gen_random_uuid()::text, 'Automjete', 'automjete', '🚗', NOW(), NOW()),
    (gen_random_uuid()::text, 'Prona', 'prona', '🏠', NOW(), NOW()),
    (gen_random_uuid()::text, 'Shtëpi & Kopsht', 'shtepi-kopsht', '🛋️', NOW(), NOW()),
    (gen_random_uuid()::text, 'Modë', 'mode', '👕', NOW(), NOW()),
    (gen_random_uuid()::text, 'Sport & Hobi', 'sport-hobi', '⚽', NOW(), NOW())
  ON CONFLICT (slug) DO NOTHING
  RETURNING id, slug
)
-- Subcategories - Using proper UUIDs and referencing parent by slug
INSERT INTO "Category" (id, name, slug, icon, "parentId", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  subcat.name,
  subcat.slug,
  subcat.icon,
  parent.id,
  NOW(),
  NOW()
FROM (VALUES
  -- Elektronikë
  ('elektronike', 'Celularë', 'celulare', NULL),
  ('elektronike', 'Laptopë & PC', 'laptop-pc', NULL),
  ('elektronike', 'Kamera & Foto', 'kamera', NULL),
  ('elektronike', 'Audio & TV', 'audio-tv', NULL),
  
  -- Automjete
  ('automjete', 'Makina', 'makina', NULL),
  ('automjete', 'Motoçikleta', 'motocikleta', NULL),
  ('automjete', 'Pjesë Këmbimi', 'pjese-kembimi', NULL),

  -- Prona
  ('prona', 'Apartamente në Shitje', 'apartamente-shitje', NULL),
  ('prona', 'Apartamente me Qira', 'apartamente-qira', NULL),
  ('prona', 'Toka & Truall', 'toka', NULL),

  -- Shtëpi & Kopsht
  ('shtepi-kopsht', 'Mobilje', 'mobilje', NULL),
  ('shtepi-kopsht', 'Elektroshtëpiake', 'elektroshtepiake', NULL),
  ('shtepi-kopsht', 'Kopsht', 'kopsht', NULL)
) AS subcat(parent_slug, name, slug, icon)
JOIN main_categories parent ON parent.slug = subcat.parent_slug
ON CONFLICT (slug) DO NOTHING;

-- Seed Albanian Cities (ordered by weight/importance) - Using proper UUIDs
INSERT INTO "Location" (id, city, country, latitude, longitude, weight, "hasZones", "createdAt", "updatedAt") VALUES
  -- Major Cities (weight 100-90)
  (gen_random_uuid()::text, 'Tiranë', 'Albania', 41.3275, 19.8187, 100, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Durrës', 'Albania', 41.3239, 19.4561, 95, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Vlorë', 'Albania', 40.4686, 19.4914, 90, false, NOW(), NOW()),
  
  -- Secondary Cities (weight 89-80)
  (gen_random_uuid()::text, 'Shkodër', 'Albania', 42.0683, 19.5133, 89, false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Elbasan', 'Albania', 41.1125, 20.0822, 85, false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Korçë', 'Albania', 40.6186, 20.7808, 84, false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Fier', 'Albania', 40.7239, 19.5628, 83, false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Berat', 'Albania', 40.7058, 19.9522, 82, false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Lushnjë', 'Albania', 40.9419, 19.7050, 81, false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Kavajë', 'Albania', 41.1844, 19.5569, 80, false, NOW(), NOW())
ON CONFLICT (city, country) DO NOTHING;
