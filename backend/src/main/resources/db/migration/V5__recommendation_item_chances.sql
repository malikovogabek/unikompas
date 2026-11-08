-- Separate admission probabilities per financing type, shown in the UI next to the
-- combined chance (e.g. "grant 45%, contract 99%"). NULL = that financing is not an option.
ALTER TABLE recommendation_items
    ADD COLUMN grant_chance    NUMERIC(5, 4),
    ADD COLUMN contract_chance NUMERIC(5, 4);
