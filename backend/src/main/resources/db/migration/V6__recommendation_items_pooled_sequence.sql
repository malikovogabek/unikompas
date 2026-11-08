-- Let Hibernate allocate recommendation item ids in blocks of 50 (pooled optimizer),
-- which enables JDBC batch inserts when a recommendation is saved.
ALTER SEQUENCE recommendation_items_id_seq INCREMENT BY 50;
