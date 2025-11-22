-- Seed Zones for Tirana and Durres
-- First, clear existing zones and update locations to mark them as having zones
DELETE FROM "Zone" WHERE "locationId" IN (SELECT id FROM "Location" WHERE city IN ('Tiranë', 'Durrës'));
UPDATE "Location" SET "hasZones" = true WHERE city IN ('Tiranë', 'Durrës');

-- Tirana Zones (comprehensive list of neighborhoods and administrative units)
-- Using proper UUIDs for consistency, without "Zona X -" prefix
INSERT INTO "Zone" (id, name, "locationId", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    zone_name,
    (SELECT id FROM "Location" WHERE city = 'Tiranë' LIMIT 1),
    NOW(),
    NOW()
FROM (VALUES
    -- Administrative Units (11 units)
    ('Qendra'),
    ('21 Dhjetori'),
    ('Ali Demi'),
    ('Kombinati'),
    ('Lapraka'),
    ('Sauk'),
    ('Kashar'),
    ('Dajt'),
    ('Farkë'),
    ('Paskuqan'),
    ('Vaqarr'),
    -- Popular Neighborhoods
    ('Blloku'),
    ('Pazari i Ri'),
    ('Komuna e Parisit'),
    ('Don Bosco'),
    ('Selitë'),
    ('Qyteti i Studentit'),
    ('Kodra e Diellit'),
    ('Lapraka e Re'),
    ('Yzberisht'),
    ('Bathore'),
    ('Krrabë'),
    ('Kamëz'),
    ('Kashar'),
    ('Petrelë'),
    ('Ndroq'),
    ('Peza'),
    ('Shëngjergj'),
    ('Zall-Bastar'),
    ('Zall-Herr')
) AS zones(zone_name)
ON CONFLICT (name, "locationId") DO NOTHING;

-- Durres Zones
INSERT INTO "Zone" (id, name, "locationId", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    zone_name,
    (SELECT id FROM "Location" WHERE city = 'Durrës' LIMIT 1),
    NOW(),
    NOW()
FROM (VALUES
    ('Qendra'),
    ('Plazhi'),
    ('Porti'),
    ('Spitali'),
    ('Stacioni'),
    ('Lidhja e Prizrenit'),
    ('Durrës Plazh'),
    ('Durrës Vjetër'),
    ('Manëz'),
    ('Sukth'),
    ('Ishëm'),
    ('Shijak')
) AS zones(zone_name)
ON CONFLICT (name, "locationId") DO NOTHING;
