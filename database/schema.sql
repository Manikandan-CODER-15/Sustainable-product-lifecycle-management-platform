-- database/schema.sql
-- Sustainable PLM Platform Database Schema for PostgreSQL / Supabase

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'USER')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sources Table (Literature, standards, and research citations)
CREATE TABLE IF NOT EXISTS sources (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    publisher VARCHAR(150),
    year INT,
    link_or_file_path TEXT,
    page_reference VARCHAR(100)
);

-- 3. Materials Table (7 core sustainability parameters + metadata)
CREATE TABLE IF NOT EXISTS materials (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type_or_grade VARCHAR(100),
    recyclability_pct DOUBLE PRECISION NOT NULL CHECK (recyclability_pct >= 0 AND recyclability_pct <= 100),
    recycled_content_pct DOUBLE PRECISION NOT NULL CHECK (recycled_content_pct >= 0 AND recycled_content_pct <= 100),
    disassembly_ease INT NOT NULL CHECK (disassembly_ease >= 1 AND disassembly_ease <= 10),
    reusability_pct DOUBLE PRECISION NOT NULL CHECK (reusability_pct >= 0 AND reusability_pct <= 100),
    repairability INT NOT NULL CHECK (repairability >= 1 AND repairability <= 10),
    lifetime_years DOUBLE PRECISION NOT NULL CHECK (lifetime_years >= 0),
    hazardous BOOLEAN NOT NULL DEFAULT FALSE,
    source_id BIGINT REFERENCES sources(id) ON DELETE SET NULL,
    notes TEXT
);

-- 4. Products Table (User-submitted products with calculated scores)
CREATE TABLE IF NOT EXISTS products (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    total_weight_g DOUBLE PRECISION NOT NULL CHECK (total_weight_g > 0),
    score DOUBLE PRECISION NOT NULL CHECK (score >= 0 AND score <= 100),
    label VARCHAR(20) NOT NULL CHECK (label IN ('Poor', 'Moderate', 'Good')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Product Materials (Join table with weight breakdown)
CREATE TABLE IF NOT EXISTS product_materials (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    material_id BIGINT NOT NULL REFERENCES materials(id) ON DELETE RESTRICT,
    weight_g DOUBLE PRECISION NOT NULL CHECK (weight_g > 0),
    CONSTRAINT uk_product_material UNIQUE (product_id, material_id)
);

-- 6. Scoring Settings (Configurable weights and band thresholds)
CREATE TABLE IF NOT EXISTS scoring_settings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    weight_recyclability DOUBLE PRECISION NOT NULL,
    weight_recycled_content DOUBLE PRECISION NOT NULL,
    weight_disassembly DOUBLE PRECISION NOT NULL,
    weight_reusability DOUBLE PRECISION NOT NULL,
    weight_repairability DOUBLE PRECISION NOT NULL,
    weight_lifetime DOUBLE PRECISION NOT NULL,
    hazardous_penalty_weight DOUBLE PRECISION NOT NULL,
    max_lifetime_years DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    threshold_poor_max DOUBLE PRECISION NOT NULL DEFAULT 40.0,
    threshold_moderate_max DOUBLE PRECISION NOT NULL DEFAULT 70.0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Optional Lifecycle Stages (Product lifecycle tracking)
CREATE TABLE IF NOT EXISTS lifecycle_stages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    stage VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    stage_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);
