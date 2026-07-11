-- ============================================================
-- Migration 001 — Extensions & Sequences
--
-- Purpose: Enable the PostgreSQL extensions that all subsequent
--          migrations depend on, and create the order_number_seq
--          sequence used by the generate_order_number() trigger.
--
-- Run order: FIRST — must complete before migration 002.
--
-- Supabase notes:
--   • uuid-ossp and pgcrypto are enabled by default in Supabase.
--   • pg_trgm and unaccent must be enabled in the Supabase
--     Dashboard under Database → Extensions, or they will be
--     created here automatically.
--   • pgvector (vector) must be enabled in the Supabase Dashboard
--     under Database → Extensions before running this migration.
--     Without it, the vector(1536) columns in migration 002 will
--     fail to create.
-- ============================================================

-- UUID generation for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Secure token generation (used by pgcrypto functions in auth)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Trigram fuzzy text search for product names and AI search queries
-- Powers: idx_products_trgm_name, idx_search_logs_query_trgm
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Accent-insensitive search normalisation (strips accents before matching)
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Vector similarity search for AI product embeddings (1536 dimensions)
-- Powers: product_embeddings.embedding, ai_tags.embedding
-- PREREQUISITE: must be enabled in Supabase Dashboard first
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================
-- Sequences
-- ============================================================

-- Generates the numeric suffix of human-readable order numbers.
-- Used by: generate_order_number() BEFORE INSERT trigger on orders.
-- Format produced: HN-20260711-0001, HN-20260711-0002, ...
-- NO CYCLE ensures the counter never wraps — a safety property for
-- financial records.
CREATE SEQUENCE IF NOT EXISTS order_number_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  NO CYCLE;
