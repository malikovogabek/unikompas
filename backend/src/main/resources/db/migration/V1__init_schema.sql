-- =====================================================================
-- UniKompas — initial schema (TZ §7)
-- =====================================================================

-- ---------- Users ----------------------------------------------------
CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    full_name     VARCHAR(120) NOT NULL,
    email         VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    role          VARCHAR(20)  NOT NULL CHECK (role IN ('APPLICANT', 'ADMIN')),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ---------- Reference data ------------------------------------------
-- `code` is a stable key the frontend uses to translate names (FR-9).
CREATE TABLE regions (
    id   BIGSERIAL PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(80) NOT NULL
);

CREATE TABLE subjects (
    id   BIGSERIAL PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(80) NOT NULL
);

CREATE TABLE fields (
    id   BIGSERIAL PRIMARY KEY,
    code VARCHAR(30)  NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    icon VARCHAR(40)
);

-- ---------- Catalog --------------------------------------------------
CREATE TABLE universities (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(200) NOT NULL,
    short_name    VARCHAR(40),
    region_id     BIGINT       NOT NULL REFERENCES regions (id),
    city          VARCHAR(80),
    address       VARCHAR(250),
    website       VARCHAR(200),
    type          VARCHAR(20)  NOT NULL CHECK (type IN ('STATE', 'PRIVATE', 'FOREIGN_BRANCH')),
    rating        SMALLINT     NOT NULL DEFAULT 50 CHECK (rating BETWEEN 0 AND 100),
    has_dormitory BOOLEAN      NOT NULL DEFAULT FALSE,
    founded_year  SMALLINT,
    description   TEXT,
    logo_url      VARCHAR(300)
);
CREATE INDEX idx_universities_region ON universities (region_id);

CREATE TABLE directions (
    id                BIGSERIAL PRIMARY KEY,
    code              VARCHAR(12)  NOT NULL UNIQUE,
    name              VARCHAR(200) NOT NULL,
    field_id          BIGINT       NOT NULL REFERENCES fields (id),
    first_subject_id  BIGINT       NOT NULL REFERENCES subjects (id),
    second_subject_id BIGINT       NOT NULL REFERENCES subjects (id),
    riasec_r          SMALLINT     NOT NULL DEFAULT 0 CHECK (riasec_r BETWEEN 0 AND 10),
    riasec_i          SMALLINT     NOT NULL DEFAULT 0 CHECK (riasec_i BETWEEN 0 AND 10),
    riasec_a          SMALLINT     NOT NULL DEFAULT 0 CHECK (riasec_a BETWEEN 0 AND 10),
    riasec_s          SMALLINT     NOT NULL DEFAULT 0 CHECK (riasec_s BETWEEN 0 AND 10),
    riasec_e          SMALLINT     NOT NULL DEFAULT 0 CHECK (riasec_e BETWEEN 0 AND 10),
    riasec_c          SMALLINT     NOT NULL DEFAULT 0 CHECK (riasec_c BETWEEN 0 AND 10),
    description       TEXT,
    career_prospects  TEXT,
    CONSTRAINT chk_directions_distinct_subjects CHECK (first_subject_id <> second_subject_id)
);
CREATE INDEX idx_directions_field ON directions (field_id);
CREATE INDEX idx_directions_subjects ON directions (first_subject_id, second_subject_id);

CREATE TABLE programs (
    id             BIGSERIAL PRIMARY KEY,
    university_id  BIGINT      NOT NULL REFERENCES universities (id) ON DELETE CASCADE,
    direction_id   BIGINT      NOT NULL REFERENCES directions (id) ON DELETE CASCADE,
    language       VARCHAR(5)  NOT NULL CHECK (language IN ('UZ', 'RU', 'EN')),
    study_form     VARCHAR(20) NOT NULL CHECK (study_form IN ('FULL_TIME', 'PART_TIME', 'EVENING', 'DISTANCE')),
    grant_quota    INT         NOT NULL DEFAULT 0 CHECK (grant_quota >= 0),
    contract_quota INT         NOT NULL DEFAULT 0 CHECK (contract_quota >= 0),
    contract_fee   BIGINT      NOT NULL DEFAULT 0 CHECK (contract_fee >= 0),
    duration_years SMALLINT    NOT NULL DEFAULT 4 CHECK (duration_years BETWEEN 1 AND 7),
    CONSTRAINT uq_programs_offer UNIQUE (university_id, direction_id, language, study_form)
);
CREATE INDEX idx_programs_direction ON programs (direction_id);

CREATE TABLE passing_scores (
    id             BIGSERIAL PRIMARY KEY,
    program_id     BIGINT       NOT NULL REFERENCES programs (id) ON DELETE CASCADE,
    year           SMALLINT     NOT NULL CHECK (year BETWEEN 2000 AND 2100),
    grant_score    NUMERIC(5, 1) CHECK (grant_score BETWEEN 0 AND 189),
    contract_score NUMERIC(5, 1) CHECK (contract_score BETWEEN 0 AND 189),
    CONSTRAINT uq_passing_scores_program_year UNIQUE (program_id, year)
);

-- ---------- Applicant ------------------------------------------------
CREATE TABLE applicant_profiles (
    id                   BIGSERIAL PRIMARY KEY,
    user_id              BIGINT       NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    region_id            BIGINT       REFERENCES regions (id),
    first_subject_id     BIGINT       REFERENCES subjects (id),
    second_subject_id    BIGINT       REFERENCES subjects (id),
    expected_score       NUMERIC(5, 1) CHECK (expected_score BETWEEN 0 AND 189),
    preferred_language   VARCHAR(5)   CHECK (preferred_language IN ('UZ', 'RU', 'EN')),
    preferred_study_form VARCHAR(20)  CHECK (preferred_study_form IN ('FULL_TIME', 'PART_TIME', 'EVENING', 'DISTANCE')),
    financing            VARCHAR(20)  NOT NULL DEFAULT 'CONTRACT_OK' CHECK (financing IN ('GRANT_ONLY', 'CONTRACT_OK')),
    max_contract_fee     BIGINT       CHECK (max_contract_fee >= 0),
    willing_to_relocate  BOOLEAN      NOT NULL DEFAULT TRUE,
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE profile_fields (
    profile_id BIGINT NOT NULL REFERENCES applicant_profiles (id) ON DELETE CASCADE,
    field_id   BIGINT NOT NULL REFERENCES fields (id) ON DELETE CASCADE,
    PRIMARY KEY (profile_id, field_id)
);

-- ---------- Career test (RIASEC) ------------------------------------
CREATE TABLE career_questions (
    id          BIGSERIAL PRIMARY KEY,
    text_uz     VARCHAR(300) NOT NULL,
    text_ru     VARCHAR(300) NOT NULL,
    text_en     VARCHAR(300) NOT NULL,
    riasec_type CHAR(1)      NOT NULL CHECK (riasec_type IN ('R', 'I', 'A', 'S', 'E', 'C')),
    order_no    SMALLINT     NOT NULL UNIQUE
);

CREATE TABLE test_attempts (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    score_r      NUMERIC(4, 3) NOT NULL,
    score_i      NUMERIC(4, 3) NOT NULL,
    score_a      NUMERIC(4, 3) NOT NULL,
    score_s      NUMERIC(4, 3) NOT NULL,
    score_e      NUMERIC(4, 3) NOT NULL,
    score_c      NUMERIC(4, 3) NOT NULL,
    holland_code VARCHAR(3)   NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_test_attempts_user ON test_attempts (user_id, created_at DESC);

-- ---------- Recommendations -----------------------------------------
CREATE TABLE recommendations (
    id             BIGSERIAL PRIMARY KEY,
    user_id        BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    input_snapshot JSONB       NOT NULL,
    weights        JSONB       NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_recommendations_user ON recommendations (user_id, created_at DESC);

CREATE TABLE recommendation_items (
    id                       BIGSERIAL PRIMARY KEY,
    recommendation_id        BIGINT        NOT NULL REFERENCES recommendations (id) ON DELETE CASCADE,
    program_id               BIGINT        NOT NULL REFERENCES programs (id) ON DELETE CASCADE,
    rank                     INT           NOT NULL,
    total_score              NUMERIC(5, 4) NOT NULL,
    interest_score           NUMERIC(5, 4) NOT NULL,
    chance_score             NUMERIC(5, 4) NOT NULL,
    preference_score         NUMERIC(5, 4) NOT NULL,
    rating_score             NUMERIC(5, 4) NOT NULL,
    category                 VARCHAR(10)   NOT NULL CHECK (category IN ('SAFE', 'TARGET', 'REACH')),
    predicted_grant_score    NUMERIC(5, 1),
    predicted_contract_score NUMERIC(5, 1),
    reasons                  JSONB         NOT NULL DEFAULT '[]'::jsonb
);
CREATE INDEX idx_recommendation_items_rec ON recommendation_items (recommendation_id, rank);

-- ---------- Favorites & settings ------------------------------------
CREATE TABLE favorites (
    user_id    BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    program_id BIGINT      NOT NULL REFERENCES programs (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, program_id)
);

CREATE TABLE app_settings (
    key   VARCHAR(100) PRIMARY KEY,
    value VARCHAR(500) NOT NULL
);

INSERT INTO app_settings (key, value) VALUES
    ('recommendation.weight.interest',   '0.35'),
    ('recommendation.weight.chance',     '0.35'),
    ('recommendation.weight.preference', '0.15'),
    ('recommendation.weight.rating',     '0.15');
