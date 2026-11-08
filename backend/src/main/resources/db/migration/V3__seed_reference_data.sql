-- =====================================================================
-- Reference data (all environments). `code` values are i18n keys on the
-- frontend (regions.<CODE>, subjects.<CODE>, fields.<CODE>); `name` is the
-- Uzbek fallback. Never renumber ids — profiles and directions refer to them.
-- =====================================================================

INSERT INTO regions (id, code, name) VALUES
    (1,  'TASHKENT_CITY',   'Toshkent shahri'),
    (2,  'TASHKENT',        'Toshkent viloyati'),
    (3,  'ANDIJAN',         'Andijon viloyati'),
    (4,  'NAMANGAN',        'Namangan viloyati'),
    (5,  'FERGANA',         'Farg‘ona viloyati'),
    (6,  'SAMARKAND',       'Samarqand viloyati'),
    (7,  'BUKHARA',         'Buxoro viloyati'),
    (8,  'NAVOI',           'Navoiy viloyati'),
    (9,  'KASHKADARYA',     'Qashqadaryo viloyati'),
    (10, 'SURKHANDARYA',    'Surxondaryo viloyati'),
    (11, 'JIZZAKH',         'Jizzax viloyati'),
    (12, 'SYRDARYA',        'Sirdaryo viloyati'),
    (13, 'KHOREZM',         'Xorazm viloyati'),
    (14, 'KARAKALPAKSTAN',  'Qoraqalpog‘iston Respublikasi');

INSERT INTO subjects (id, code, name) VALUES
    (1,  'MATH',        'Matematika'),
    (2,  'PHYSICS',     'Fizika'),
    (3,  'CHEMISTRY',   'Kimyo'),
    (4,  'BIOLOGY',     'Biologiya'),
    (5,  'HISTORY',     'Tarix'),
    (6,  'GEOGRAPHY',   'Geografiya'),
    (7,  'NATIVE_LANG', 'Ona tili va adabiyoti'),
    (8,  'ENGLISH',     'Ingliz tili'),
    (9,  'RUSSIAN',     'Rus tili'),
    (10, 'LAW',         'Huquqshunoslik asoslari');

INSERT INTO fields (id, code, name, icon) VALUES
    (1,  'IT',               'Axborot texnologiyalari',          'cpu'),
    (2,  'ENGINEERING',      'Muhandislik va texnika',           'cog'),
    (3,  'ARCHITECTURE',     'Arxitektura va qurilish',          'building-2'),
    (4,  'MEDICINE',         'Tibbiyot va farmatsiya',           'stethoscope'),
    (5,  'NATURAL_SCIENCES', 'Tabiiy va aniq fanlar',            'atom'),
    (6,  'ECONOMICS',        'Iqtisodiyot va biznes',            'trending-up'),
    (7,  'LAW',              'Huquqshunoslik',                   'scale'),
    (8,  'SOCIAL_SCIENCES',  'Ijtimoiy fanlar va jurnalistika',  'users'),
    (9,  'EDUCATION',        'Pedagogika',                       'graduation-cap'),
    (10, 'LANGUAGES',        'Filologiya va tillar',             'languages'),
    (11, 'AGRICULTURE',      'Qishloq xo‘jaligi',                'sprout'),
    (12, 'ARTS',             'San’at va dizayn',                 'palette');

-- Keep identity sequences ahead of the explicit ids above.
SELECT setval(pg_get_serial_sequence('regions', 'id'),  (SELECT max(id) FROM regions));
SELECT setval(pg_get_serial_sequence('subjects', 'id'), (SELECT max(id) FROM subjects));
SELECT setval(pg_get_serial_sequence('fields', 'id'),   (SELECT max(id) FROM fields));
