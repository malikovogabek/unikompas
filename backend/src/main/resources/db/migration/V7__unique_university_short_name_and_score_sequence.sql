-- 1) The CSV import identifies universities by short name, so it must be unique
--    (case-insensitive). NULL short names are allowed (such universities cannot be
--    targeted by CSV and are edited manually).
CREATE UNIQUE INDEX uq_universities_short_name_lower ON universities (lower(short_name)) WHERE short_name IS NOT NULL;

-- 2) Pooled id allocation for passing scores so bulk imports are sent as JDBC batches.
ALTER SEQUENCE passing_scores_id_seq INCREMENT BY 50;
