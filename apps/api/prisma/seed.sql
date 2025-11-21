-- Seed Admin User
-- Password: admin123
INSERT INTO "User" (id, email, password, name, phone, role, "createdAt", "updatedAt") VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@marketplace.com', '$2b$10$vdkEvVmigMzyI.OdEwHSCuSqQkFccYCAgx.VUsqsUOTYjGLjmIUqq', 'Admin User', '+355691234567', 'ADMIN', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Seed Categories (Hierarchical & UUIDs)
-- Main Categories
INSERT INTO "Category" (id, name, slug, icon, "createdAt", "updatedAt") VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Elektronikë', 'elektronike', '📱', NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000002', 'Automjete', 'automjete', '🚗', NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000003', 'Prona', 'prona', '🏠', NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000004', 'Shtëpi & Kopsht', 'shtepi-kopsht', '🛋️', NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000005', 'Modë', 'mode', '👕', NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000006', 'Sport & Hobi', 'sport-hobi', '⚽', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Subcategories
INSERT INTO "Category" (id, name, slug, icon, "parentId", "createdAt", "updatedAt") VALUES
  -- Elektronikë
  ('c1000000-0000-0000-0000-000000000001', 'Celularë', 'celulare', NULL, 'c0000000-0000-0000-0000-000000000001', NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000002', 'Laptopë & PC', 'laptop-pc', NULL, 'c0000000-0000-0000-0000-000000000001', NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000003', 'Kamera & Foto', 'kamera', NULL, 'c0000000-0000-0000-0000-000000000001', NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000004', 'Audio & TV', 'audio-tv', NULL, 'c0000000-0000-0000-0000-000000000001', NOW(), NOW()),
  
  -- Automjete
  ('c2000000-0000-0000-0000-000000000001', 'Makina', 'makina', NULL, 'c0000000-0000-0000-0000-000000000002', NOW(), NOW()),
  ('c2000000-0000-0000-0000-000000000002', 'Motoçikleta', 'motocikleta', NULL, 'c0000000-0000-0000-0000-000000000002', NOW(), NOW()),
  ('c2000000-0000-0000-0000-000000000003', 'Pjesë Këmbimi', 'pjese-kembimi', NULL, 'c0000000-0000-0000-0000-000000000002', NOW(), NOW()),

  -- Prona
  ('c3000000-0000-0000-0000-000000000001', 'Apartamente në Shitje', 'apartamente-shitje', NULL, 'c0000000-0000-0000-0000-000000000003', NOW(), NOW()),
  ('c3000000-0000-0000-0000-000000000002', 'Apartamente me Qira', 'apartamente-qira', NULL, 'c0000000-0000-0000-0000-000000000003', NOW(), NOW()),
  ('c3000000-0000-0000-0000-000000000003', 'Toka & Truall', 'toka', NULL, 'c0000000-0000-0000-0000-000000000003', NOW(), NOW()),

  -- Shtëpi & Kopsht
  ('c4000000-0000-0000-0000-000000000001', 'Mobilje', 'mobilje', NULL, 'c0000000-0000-0000-0000-000000000004', NOW(), NOW()),
  ('c4000000-0000-0000-0000-000000000002', 'Elektroshtëpiake', 'elektroshtepiake', NULL, 'c0000000-0000-0000-0000-000000000004', NOW(), NOW()),
  ('c4000000-0000-0000-0000-000000000003', 'Kopsht', 'kopsht', NULL, 'c0000000-0000-0000-0000-000000000004', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Seed Albanian Cities (ordered by weight/importance)
INSERT INTO "Location" (id, city, country, latitude, longitude, weight, "createdAt", "updatedAt") VALUES
  -- Major Cities (weight 100-90)
  ('l0000000-0000-0000-0000-000000000001', 'Tiranë', 'Albania', 41.3275, 19.8187, 100, NOW(), NOW()),
  ('l0000000-0000-0000-0000-000000000002', 'Durrës', 'Albania', 41.3239, 19.4561, 95, NOW(), NOW()),
  ('l0000000-0000-0000-0000-000000000003', 'Vlorë', 'Albania', 40.4686, 19.4914, 90, NOW(), NOW()),
  
  -- Secondary Cities (weight 89-80)
  ('l0000000-0000-0000-0000-000000000004', 'Shkodër', 'Albania', 42.0683, 19.5133, 89, NOW(), NOW()),
  ('l0000000-0000-0000-0000-000000000005', 'Elbasan', 'Albania', 41.1125, 20.0822, 85, NOW(), NOW()),
  ('l0000000-0000-0000-0000-000000000006', 'Korçë', 'Albania', 40.6186, 20.7808, 84, NOW(), NOW()),
  ('l0000000-0000-0000-0000-000000000007', 'Fier', 'Albania', 40.7239, 19.5628, 83, NOW(), NOW()),
  ('l0000000-0000-0000-0000-000000000008', 'Berat', 'Albania', 40.7058, 19.9522, 82, NOW(), NOW()),
  ('l0000000-0000-0000-0000-000000000009', 'Lushnjë', 'Albania', 40.9419, 19.7050, 81, NOW(), NOW()),
  ('l0000000-0000-0000-0000-000000000010', 'Kavajë', 'Albania', 41.1844, 19.5569, 80, NOW(), NOW())
ON CONFLICT (city, country) DO NOTHING;
