-- Expanded Sustainable Materials Library for Circular PLM Platform
INSERT INTO materials (name, type_or_grade, recyclability_pct, recycled_content_pct, disassembly_ease, reusability_pct, repairability, lifetime_years, hazardous, source_id, notes)
VALUES
-- Bio-based and Degradable Polymers
('PLA (Polylactic Acid)', 'Bio-Polymer 3D Grade', 75.0, 0.0, 8, 40.0, 5, 3.0, FALSE, 1, 'Compostable under industrial conditions (ISO 14855)'),
('PHA (Polyhydroxyalkanoates)', 'Marine Degradable Bioplastic', 85.0, 0.0, 7, 30.0, 4, 2.0, FALSE, 1, 'Naturally biodegradable in soil and ocean environments'),
('Cellulose Acetate', 'Bio-based Thermoplastic', 60.0, 20.0, 6, 35.0, 4, 5.0, FALSE, 1, 'Renewable plant fiber origin commonly used in eyewear and filtration'),

-- Recycled & Circular Commodity Plastics
('rPET (Recycled Polyethylene Terephthalate)', 'Food-Contact Bottle Grade', 90.0, 80.0, 8, 70.0, 6, 15.0, FALSE, 1, 'High circularity index closed-loop bottle recycling'),
('HDPE (High-Density Polyethylene)', 'Extrusion / Blow Molding Grade', 85.0, 30.0, 8, 65.0, 6, 20.0, FALSE, 1, 'Robust chemical resistance, widely recycled curbside'),
('LDPE (Low-Density Polyethylene)', 'Film / Flexible Packaging', 60.0, 15.0, 7, 45.0, 4, 8.0, FALSE, 1, 'Clean film streams recyclable into trash bags and construction films'),
('Nylon 6 (Polyamide 6 / Econyl)', 'Depolymerized Textile & Gear Grade', 80.0, 65.0, 7, 60.0, 7, 18.0, FALSE, 1, 'Infinitely recyclable through chemical regeneration of caprolactam'),
('PTFE (Teflon)', 'Fluoropolymer High-Heat', 15.0, 0.0, 3, 20.0, 3, 25.0, TRUE, 1, 'Persistent PFAS chemicals; difficult to depolymerize'),

-- Metals & Alloys
('Titanium Alloy (Ti-6Al-4V Grade 5)', 'Aerospace & Biomedical Spec', 92.0, 20.0, 9, 85.0, 8, 40.0, FALSE, 1, 'Extreme corrosion resistance and long operational life'),
('Brass (C36000 Free-Cutting)', 'Copper-Zinc Alloy', 88.0, 45.0, 8, 75.0, 7, 30.0, FALSE, 1, 'Easily separated and remelted with low alloy degradation'),
('Cast Iron (Class 30 Gray Iron)', 'Foundry Structural', 85.0, 70.0, 7, 70.0, 6, 35.0, FALSE, 1, 'High recycled scrap input during foundry melt'),
('Magnesium Alloy (AZ91D)', 'Die-Casting Lightweight', 80.0, 15.0, 7, 60.0, 5, 15.0, FALSE, 1, 'Lightest structural metal; reduces vehicle operational energy'),

-- Glass, Ceramics & Natural Materials
('Borosilicate Glass', 'Low-Expansion Laboratory Grade', 75.0, 10.0, 6, 70.0, 5, 25.0, FALSE, 1, 'Thermal shock resistant, durable multi-use lab and consumer glassware'),
('Soda-Lime Container Glass', 'Cullet Recycled Grade', 95.0, 55.0, 8, 85.0, 6, 30.0, FALSE, 1, '100% infinitely recyclable without loss of purity or quality'),
('Bamboo Composite', 'Natural Fiber Reinforced Resin', 45.0, 0.0, 5, 40.0, 4, 6.0, FALSE, 1, 'Rapidly renewable biomass fiber structure'),
('Solid Oak / Hardwood (FSC Certified)', 'Sustainable Forestry Timber', 70.0, 0.0, 8, 80.0, 8, 50.0, FALSE, 1, 'Carbon-negative renewable material easily repaired and refurbished'),
('Organic Cotton Fabric', 'GOTS Certified Textile', 65.0, 10.0, 8, 50.0, 7, 4.0, FALSE, 1, 'Non-toxic biological cycle fiber capable of composting'),

-- Electronics & Energy Storage
('Silicon Wafer (Solar / Semiconductor)', 'Monocrystalline PV Grade', 50.0, 5.0, 4, 30.0, 3, 25.0, FALSE, 1, 'High embodied energy; valuable silver and silicon reclaimed at EOL'),
('LFP Battery Cell (LiFePO4)', 'Prismatic Energy Storage', 45.0, 10.0, 4, 35.0, 3, 10.0, FALSE, 1, 'Cobalt/Nickel free, safer chemistry with high cycle durability')
ON CONFLICT (name) DO UPDATE SET
    type_or_grade = EXCLUDED.type_or_grade,
    recyclability_pct = EXCLUDED.recyclability_pct,
    recycled_content_pct = EXCLUDED.recycled_content_pct,
    disassembly_ease = EXCLUDED.disassembly_ease,
    reusability_pct = EXCLUDED.reusability_pct,
    repairability = EXCLUDED.repairability,
    lifetime_years = EXCLUDED.lifetime_years,
    hazardous = EXCLUDED.hazardous,
    notes = EXCLUDED.notes;
