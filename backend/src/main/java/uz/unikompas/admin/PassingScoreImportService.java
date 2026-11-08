package uz.unikompas.admin;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UncheckedIOException;
import java.math.BigDecimal;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import uz.unikompas.admin.dto.ImportReport;
import uz.unikompas.admin.dto.ImportReport.RowError;
import uz.unikompas.common.exception.FieldValidationException;
import uz.unikompas.program.PassingScore;
import uz.unikompas.program.PassingScoreRepository;
import uz.unikompas.program.Program;
import uz.unikompas.program.ProgramRepository;
import uz.unikompas.program.StudyForm;
import uz.unikompas.program.StudyLanguage;

/**
 * Bulk import of passing scores from CSV (FR-8.5). Expected header (comma or semicolon separated):
 * <pre>
 * university,direction_code,language,study_form,year,grant_score,contract_score
 * TATU,60610100,UZ,FULL_TIME,2026,165.2,132.0
 * </pre>
 * {@code university} is the university short name (case-insensitive, unique since V7); universities
 * without a short name cannot be targeted. The file must be UTF-8 (a BOM is allowed). An empty score means
 * "no places of that type". Rows are upserted by (program, year). Valid rows are saved even
 * if other rows fail; failures are reported per line.
 */
@Service
@RequiredArgsConstructor
public class PassingScoreImportService {

    static final List<String> HEADER = List.of(
            "university", "direction_code", "language", "study_form", "year", "grant_score", "contract_score");
    static final int MAX_ROWS = 10_000;
    private static final BigDecimal MAX_SCORE = new BigDecimal("189");

    private final ProgramRepository programs;
    private final PassingScoreRepository scores;

    @Transactional
    public ImportReport importCsv(MultipartFile file) {
        if (file.isEmpty()) {
            throw FieldValidationException.of("file", "Empty");
        }
        List<String> lines;
        try (InputStream in = file.getInputStream()) {
            lines = readLines(in);
        } catch (IOException | UncheckedIOException e) {
            throw FieldValidationException.of("file", "Unreadable");
        }
        if (lines.isEmpty()) {
            throw FieldValidationException.of("file", "Empty");
        }
        char sep = lines.getFirst().contains(";") && !lines.getFirst().contains(",") ? ';' : ',';
        List<String> header = split(lines.getFirst(), sep).stream().map(h -> h.trim().toLowerCase(Locale.ROOT)).toList();
        if (!header.equals(HEADER)) {
            throw FieldValidationException.of("file", "InvalidHeader");
        }
        if (lines.size() - 1 > MAX_ROWS) {
            throw FieldValidationException.of("file", "TooManyRows");
        }

        Map<String, Program> byKey = programs.findAllWithUniversityAndDirection().stream()
                .filter(p -> p.getUniversity().getShortName() != null)
                .collect(Collectors.toMap(p -> key(p.getUniversity().getShortName(), p.getDirection().getCode(),
                        p.getLanguage().name(), p.getStudyForm().name()), Function.identity(), (a, b) -> a));

        List<RowError> errors = new ArrayList<>();
        List<ParsedRow> rows = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        int total = 0;
        for (int i = 1; i < lines.size(); i++) {
            int lineNo = i + 1;
            String line = lines.get(i);
            if (line.isBlank()) {
                continue;
            }
            total++;
            List<String> c = split(line, sep);
            if (c.size() != HEADER.size()) {
                errors.add(new RowError(lineNo, "COLUMN_COUNT", String.valueOf(c.size())));
                continue;
            }
            String lang = c.get(2).trim().toUpperCase(Locale.ROOT);
            String form = c.get(3).trim().toUpperCase(Locale.ROOT);
            if (!isEnum(StudyLanguage.class, lang)) {
                errors.add(new RowError(lineNo, "INVALID_LANGUAGE", lang));
                continue;
            }
            if (!isEnum(StudyForm.class, form)) {
                errors.add(new RowError(lineNo, "INVALID_STUDY_FORM", form));
                continue;
            }
            Program program = byKey.get(key(c.get(0), c.get(1), lang, form));
            if (program == null) {
                errors.add(new RowError(lineNo, "UNKNOWN_PROGRAM", c.get(0).trim() + "/" + c.get(1).trim()));
                continue;
            }
            Integer year = parseYear(c.get(4));
            if (year == null) {
                errors.add(new RowError(lineNo, "INVALID_YEAR", c.get(4).trim()));
                continue;
            }
            BigDecimal grant;
            BigDecimal contract;
            try {
                grant = parseScore(c.get(5));
                contract = parseScore(c.get(6));
            } catch (IllegalArgumentException e) {
                errors.add(new RowError(lineNo, "INVALID_SCORE", e.getMessage()));
                continue;
            }
            if (!seen.add(program.getId() + "/" + year)) {
                errors.add(new RowError(lineNo, "DUPLICATE_ROW", program.getId() + "/" + year));
                continue;
            }
            rows.add(new ParsedRow(program, year, grant, contract));
        }

        Map<String, PassingScore> existing = new HashMap<>();
        List<PassingScore> toSave = new ArrayList<>(rows.size());
        scores.findByProgramIds(rows.stream().map(r -> r.program().getId()).distinct().toList())
                .forEach(s -> existing.put(s.getProgram().getId() + "/" + s.getYear(), s));
        int created = 0;
        int updated = 0;
        for (ParsedRow r : rows) {
            PassingScore s = existing.get(r.program().getId() + "/" + r.year());
            if (s == null) {
                s = new PassingScore();
                s.setProgram(r.program());
                s.setYear((short) r.year());
                created++;
            } else {
                updated++;
            }
            s.setGrantScore(r.grant());
            s.setContractScore(r.contract());
            toSave.add(s);
        }
        scores.saveAll(toSave); // pooled sequence + hibernate.jdbc.batch_size -> batched inserts
        return new ImportReport(total, created, updated, errors);
    }

    private record ParsedRow(Program program, int year, BigDecimal grant, BigDecimal contract) {
    }

    /**
     * Reads strict UTF-8: a file saved in another encoding (e.g. Windows-1251 from Excel)
     * is rejected with {@code file: Encoding} instead of silently producing U+FFFD characters.
     */
    private static List<String> readLines(InputStream in) throws IOException {
        var decoder = StandardCharsets.UTF_8.newDecoder()
                .onMalformedInput(CodingErrorAction.REPORT)
                .onUnmappableCharacter(CodingErrorAction.REPORT);
        List<String> lines = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(in, decoder))) {
            String line;
            while ((line = reader.readLine()) != null) {
                lines.add(line);
            }
        } catch (CharacterCodingException e) {
            throw FieldValidationException.of("file", "Encoding");
        }
        if (!lines.isEmpty() && lines.getFirst().startsWith("\uFEFF")) {
            lines.set(0, lines.getFirst().substring(1)); // Excel UTF-8 BOM
        }
        return lines;
    }

    /** Splits a CSV line; supports double-quoted fields with escaped quotes (""). */
    static List<String> split(String line, char sep) {
        List<String> out = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        boolean quoted = false;
        for (int i = 0; i < line.length(); i++) {
            char ch = line.charAt(i);
            if (quoted) {
                if (ch == '"' && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    cur.append('"');
                    i++;
                } else if (ch == '"') {
                    quoted = false;
                } else {
                    cur.append(ch);
                }
            } else if (ch == '"') {
                quoted = true;
            } else if (ch == sep) {
                out.add(cur.toString());
                cur.setLength(0);
            } else {
                cur.append(ch);
            }
        }
        out.add(cur.toString());
        return out;
    }

    private static String key(String university, String code, String lang, String form) {
        return university.trim().toLowerCase(Locale.ROOT) + "|" + code.trim() + "|" + lang + "|" + form;
    }

    private static <E extends Enum<E>> boolean isEnum(Class<E> type, String value) {
        for (E e : type.getEnumConstants()) {
            if (e.name().equals(value)) {
                return true;
            }
        }
        return false;
    }

    private static Integer parseYear(String raw) {
        try {
            int y = Integer.parseInt(raw.trim());
            return y >= 2000 && y <= 2100 ? y : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /** Empty → null; accepts a decimal comma (Excel in uz/ru locales). */
    private static BigDecimal parseScore(String raw) {
        String v = raw.trim().replace(',', '.');
        if (v.isEmpty()) {
            return null;
        }
        try {
            BigDecimal score = new BigDecimal(v);
            if (score.signum() < 0 || score.compareTo(MAX_SCORE) > 0 || score.scale() > 1) {
                throw new IllegalArgumentException(raw.trim());
            }
            return score;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(raw.trim());
        }
    }
}
