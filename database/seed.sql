-- database/seed.sql
-- Sustainable PLM Platform Initial Seed Data

-- 1. Insert Placeholder Source
INSERT INTO sources (title, publisher, year, link_or_file_path, page_reference)
VALUES ('PLACEHOLDER Reference Data', 'Internal System Placeholder', 2026, 'N/A', 'N/A');

-- 2. Insert Default Scoring Settings (Weights sum to 1.0)
INSERT INTO scoring_settings (
    weight_recyclability,
    weight_recycled_content,
    weight_disassembly,
    weight_reusability,
    weight_repairability,
    weight_lifetime,
    hazardous_penalty_weight,
    max_lifetime_years,
    threshold_poor_max,
    threshold_moderate_max
) VALUES (
    0.25, -- 25% Recyclability
    0.15, -- 15% Recycled Content
    0.15, -- 15% Disassembly Ease
    0.15, -- 15% Reusability
    0.15, -- 15% Repairability
    0.15, -- 15% Lifetime
    0.30, -- 30% Hazardous Penalty Weight
    20.0, -- Max baseline lifetime 20 years
    40.0, -- Poor threshold: 0 - 40
    70.0  -- Moderate threshold: 41 - 70 (Good: 71 - 100)
);

-- 3. Insert Default Users (Password: Password@123 encoded with BCrypt)
-- Hash generated using standard BCrypt ($2a$10$wKxN0s3lPz9g2I2P6A4O.eZ5J0S1QcIeN94W1FfTsmXzKkJn4ePky)
INSERT INTO users (name, email, password, role, active)
VALUES 
('System Admin', 'admin@plm.local', '$2a$10$wKxN0s3lPz9g2I2P6A4O.eZ5J0S1QcIeN94W1FfTsmXzKkJn4ePky', 'ADMIN', TRUE),
('Mani User', 'mani@plm.local', '$2a$10$wKxN0s3lPz9g2I2P6A4O.eZ5J0S1QcIeN94W1FfTsmXzKkJn4ePky', 'USER', TRUE);

-- 4. Insert 10 Benchmark Materials (All linked to the PLACEHOLDER source id = 1)
INSERT INTO materials (
    name, type_or_grade, recyclability_pct, recycled_content_pct, 
    disassembly_ease, reusability_pct, repairability, lifetime_years, 
    hazardous, source_id, notes
) VALUES
('Aluminium', 'Alloy 6061', 90.0, 45.0, 8, 70.0, 7, 25.0, FALSE, 1, 'High recyclability and high structural durability'),
('Steel', 'Structural Low-Carbon', 85.0, 40.0, 8, 65.0, 8, 30.0, FALSE, 1, 'Highly magnetic and easily separable for recycling'),
('Copper', 'Electrolytic Tough Pitch', 80.0, 30.0, 7, 60.0, 7, 25.0, FALSE, 1, 'Standard electrical copper with established scrap stream'),
('Glass', 'Soda-Lime Container', 95.0, 50.0, 9, 80.0, 4, 15.0, FALSE, 1, 'Infinitely recyclable without quality degradation'),
('PET Plastic', 'Bottle Grade rPET compatible', 75.0, 25.0, 7, 50.0, 5, 8.0, FALSE, 1, 'Readily accepted in mechanical recycling streams'),
('ABS Plastic', 'Injection Molding Grade', 45.0, 10.0, 5, 40.0, 5, 10.0, FALSE, 1, 'Thermoplastic used in housings; limited recycling infrastructure'),
('Printed Circuit Board (PCB)', 'FR4 Multi-layer', 20.0, 5.0, 2, 10.0, 3, 7.0, TRUE, 1, 'Complex composite with flame retardants and heavy metals'),
('Lithium-ion Battery Cell', 'NMC 18650', 35.0, 10.0, 3, 20.0, 2, 5.0, TRUE, 1, 'Hazardous e-waste requiring specialized hydrometallurgical recycling'),
('Paper / Cardboard', 'Corrugated Packaging', 80.0, 60.0, 9, 40.0, 3, 2.0, FALSE, 1, 'Biodegradable and organic packaging material'),
('Rubber', 'Vulcanized Natural/Synthetic', 25.0, 5.0, 4, 20.0, 3, 10.0, FALSE, 1, 'Cross-linked elastomer; difficult to devulcanize');

-- 5. Performance Indexes (Speed up most frequent queries)
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_materials_product_id ON product_materials (product_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
