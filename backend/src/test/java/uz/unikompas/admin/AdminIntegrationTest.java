package uz.unikompas.admin;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import uz.unikompas.support.IntegrationTest;

/**
 * Admin API (FR-8): role protection, catalog CRUD with validation, passing scores,
 * CSV import report, algorithm weights, statistics and user list.
 */
@IntegrationTest
class AdminIntegrationTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    uz.unikompas.user.UserRepository users;

    private String admin;

    @BeforeEach
    void login() throws Exception {
        String body = mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@test.uz\",\"password\":\"Admin123!\"}"))
                .andReturn().getResponse().getContentAsString();
        admin = "Bearer " + JsonPath.read(body, "$.accessToken");
    }

    private String applicant() throws Exception {
        String body = mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Admin Test\",\"email\":\"%s@x.uz\",\"password\":\"Parol2026\"}"
                                .formatted(UUID.randomUUID())))
                .andReturn().getResponse().getContentAsString();
        return "Bearer " + JsonPath.read(body, "$.accessToken");
    }

    private long create(String path, String json) throws Exception {
        String body = mvc.perform(post(path).header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(body, "$.id")).longValue();
    }

    private static String uni(String shortName) {
        return """
                {"name":"Test OTM %s","shortName":"%s","regionId":1,"type":"PRIVATE","rating":60,
                 "hasDormitory":false}""".formatted(shortName, shortName);
    }

    private static String direction(String code) {
        return """
                {"code":"%s","name":"Test yo‘nalish","fieldId":1,"firstSubjectId":1,"secondSubjectId":2,
                 "riasec":{"r":5,"i":9,"a":3,"s":2,"e":3,"c":6}}""".formatted(code);
    }

    private static String program(long uniId, long dirId) {
        return """
                {"universityId":%d,"directionId":%d,"language":"UZ","studyForm":"FULL_TIME",
                 "grantQuota":0,"contractQuota":50,"contractFee":20000000,"durationYears":4}""".formatted(uniId, dirId);
    }

    @Test
    void shouldForbidAdminApiForApplicantsAndGuests() throws Exception {
        mvc.perform(get("/api/v1/admin/stats").header("Authorization", applicant())).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/admin/stats")).andExpect(status().isUnauthorized());
    }

    @Test
    void shouldManageCatalogWithValidation() throws Exception {
        long uniId = create("/api/v1/admin/universities", uni("CRUD1"));
        mvc.perform(post("/api/v1/admin/universities").header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON).content(uni("X").replace("\"regionId\":1", "\"regionId\":999")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.regionId").value("Exists"));

        long dirId = create("/api/v1/admin/directions", direction("69000001"));
        mvc.perform(post("/api/v1/admin/directions").header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON).content(direction("69000001")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.code").value("Unique"));

        long progId = create("/api/v1/admin/programs", program(uniId, dirId));
        mvc.perform(post("/api/v1/admin/programs").header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON).content(program(uniId, dirId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.studyForm").value("Unique"));

        mvc.perform(put("/api/v1/admin/universities/" + uniId).header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON).content(uni("CRUD1").replace("60", "75")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.rating").value(75));

        mvc.perform(get("/api/v1/admin/programs").param("universityId", String.valueOf(uniId))
                        .header("Authorization", admin))
                .andExpect(jsonPath("$.totalElements").value(1));

        // Deleting the university cascades to its programs.
        mvc.perform(delete("/api/v1/admin/universities/" + uniId).header("Authorization", admin))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/programs/" + progId)).andExpect(status().isNotFound());
        mvc.perform(delete("/api/v1/admin/directions/" + dirId).header("Authorization", admin))
                .andExpect(status().isNoContent());
    }

    @Test
    void shouldReplacePassingScoreHistory() throws Exception {
        long progId = create("/api/v1/admin/programs",
                program(create("/api/v1/admin/universities", uni("PS1")), create("/api/v1/admin/directions", direction("69000002"))));
        String path = "/api/v1/admin/programs/" + progId + "/passing-scores";
        mvc.perform(put(path).header("Authorization", admin).contentType(MediaType.APPLICATION_JSON).content("""
                        [{"year":2024,"contractScore":100.0},{"year":2025,"contractScore":102.5}]"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scoreHistory", hasSize(2)));
        // PUT replaces: 2024 is removed, 2025 updated, 2026 added.
        mvc.perform(put(path).header("Authorization", admin).contentType(MediaType.APPLICATION_JSON).content("""
                        [{"year":2025,"contractScore":103.0},{"year":2026,"contractScore":105.0}]"""))
                .andExpect(jsonPath("$.scoreHistory[*].year", org.hamcrest.Matchers.contains(2025, 2026)))
                .andExpect(jsonPath("$.scoreHistory[0].contractScore").value(103.0));
        mvc.perform(put(path).header("Authorization", admin).contentType(MediaType.APPLICATION_JSON).content("""
                        [{"year":2026,"contractScore":105.0},{"year":2026,"contractScore":190}]"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors['scores[1].contractScore']").value("DecimalMax"));
        mvc.perform(put(path).header("Authorization", admin).contentType(MediaType.APPLICATION_JSON).content("[null]"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
        mvc.perform(put(path).header("Authorization", admin).contentType(MediaType.APPLICATION_JSON).content("""
                        [{"year":2026,"contractScore":105.0},{"year":2026,"contractScore":106.0}]"""))
                .andExpect(jsonPath("$.fieldErrors.year").value("Duplicate"));
    }

    @Test
    void shouldRequireUniqueShortName_andAllowBlankOptionalUrls() throws Exception {
        create("/api/v1/admin/universities", uni("UNIQ1"));
        mvc.perform(post("/api/v1/admin/universities").header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON).content(uni("uniq1")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.shortName").value("Unique"));
        mvc.perform(post("/api/v1/admin/universities").header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON).content("""
                                {"name":"No site","shortName":"NOSITE","regionId":1,"type":"STATE","rating":50,
                                 "hasDormitory":true,"website":"","logoUrl":""}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.website").doesNotExist());
    }

    @Test
    void shouldRejectNonUtf8Csv() throws Exception {
        byte[] cp1251 = ("university,direction_code,language,study_form,year,grant_score,contract_score\n"
                + "ТАТУ,60610100,UZ,FULL_TIME,2026,150,120\n").getBytes(java.nio.charset.Charset.forName("windows-1251"));
        mvc.perform(multipart("/api/v1/admin/import/passing-scores")
                        .file(new MockMultipartFile("file", "s.csv", "text/csv", cp1251))
                        .header("Authorization", admin))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.file").value("Encoding"));
    }

    @Test
    void shouldImportCsvAndReportBadRows() throws Exception {
        create("/api/v1/admin/programs",
                program(create("/api/v1/admin/universities", uni("CSV1")), create("/api/v1/admin/directions", direction("69000003"))));
        String csv = """
                university,direction_code,language,study_form,year,grant_score,contract_score
                CSV1,69000003,UZ,FULL_TIME,2025,,98.5
                csv1,69000003,uz,full_time,2025,,99,5
                NOPE,60610100,UZ,FULL_TIME,2026,150,120
                CSV1,69000003,UZ,FULL_TIME,2026,,250
                CSV1,69000003,XX,FULL_TIME,2026,,100
                CSV1,69000003
                """;
        // Line 3 has a decimal comma → 8 columns with a plain comma separator → COLUMN_COUNT.
        mvc.perform(multipart("/api/v1/admin/import/passing-scores")
                        .file(new MockMultipartFile("file", "s.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8)))
                        .header("Authorization", admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRows").value(6))
                .andExpect(jsonPath("$.created").value(1))
                .andExpect(jsonPath("$.errors[*].code", org.hamcrest.Matchers.containsInAnyOrder(
                        "COLUMN_COUNT", "UNKNOWN_PROGRAM", "INVALID_SCORE", "INVALID_LANGUAGE", "COLUMN_COUNT")))
                .andExpect(jsonPath("$.errors[0].line").value(3));

        String semicolon = "university;direction_code;language;study_form;year;grant_score;contract_score\n"
                + "CSV1;69000003;UZ;FULL_TIME;2025;;99,5\n";
        mvc.perform(multipart("/api/v1/admin/import/passing-scores")
                        .file(new MockMultipartFile("file", "s.csv", "text/csv", semicolon.getBytes(StandardCharsets.UTF_8)))
                        .header("Authorization", admin))
                .andExpect(jsonPath("$.updated").value(1))
                .andExpect(jsonPath("$.errors", hasSize(0)));

        mvc.perform(multipart("/api/v1/admin/import/passing-scores")
                        .file(new MockMultipartFile("file", "s.csv", "text/csv", "a,b\n1,2".getBytes(StandardCharsets.UTF_8)))
                        .header("Authorization", admin))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.file").value("InvalidHeader"));
    }

    @Test
    void shouldValidateAndApplyWeights() throws Exception {
        String path = "/api/v1/admin/settings/recommendation-weights";
        mvc.perform(put(path).header("Authorization", admin).contentType(MediaType.APPLICATION_JSON).content("""
                        {"interest":0.5,"chance":0.5,"preference":0.5,"rating":0}"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.weights").value("SumToOne"));
        mvc.perform(put(path).header("Authorization", admin).contentType(MediaType.APPLICATION_JSON).content("""
                        {"interest":0.4,"chance":0.4,"preference":0.1,"rating":0.1}"""))
                .andExpect(status().isOk());
        mvc.perform(get(path).header("Authorization", admin)).andExpect(jsonPath("$.interest").value(0.4));
        mvc.perform(put(path).header("Authorization", admin).contentType(MediaType.APPLICATION_JSON).content("""
                        {"interest":0.35,"chance":0.35,"preference":0.15,"rating":0.15}"""))
                .andExpect(status().isOk());
    }

    @Test
    void shouldTrackSignInsAndShowActivityToAdmins() throws Exception {
        String email = "activity-" + UUID.randomUUID() + "@x.uz";
        mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Active User\",\"email\":\"%s\",\"password\":\"Parol2026\"}".formatted(email)))
                .andExpect(jsonPath("$.user.loginCount").value(1))
                .andExpect(jsonPath("$.user.lastSeenAt").isNotEmpty());
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"%s\",\"password\":\"Parol2026\"}".formatted(email)))
                .andExpect(jsonPath("$.user.loginCount").value(2));
        // Concurrent sign-ins are counted atomically: none is lost.
        java.util.concurrent.ExecutorService pool = java.util.concurrent.Executors.newFixedThreadPool(4);
        try {
            java.util.List<java.util.concurrent.Future<?>> logins = new java.util.ArrayList<>();
            for (int i = 0; i < 4; i++) {
                logins.add(pool.submit(() -> mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                                .content("{\"email\":\"%s\",\"password\":\"Parol2026\"}".formatted(email)))
                        .andExpect(status().isOk())));
            }
            for (java.util.concurrent.Future<?> f : logins) {
                f.get();
            }
        } finally {
            pool.shutdown();
        }
        // A failed attempt is not a sign-in.
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"%s\",\"password\":\"WrongPass1\"}".formatted(email)))
                .andExpect(status().isUnauthorized());

        mvc.perform(get("/api/v1/admin/users").param("search", email).header("Authorization", admin))
                .andExpect(jsonPath("$.content[0].loginCount").value(6))
                .andExpect(jsonPath("$.content[0].lastSeenAt").isNotEmpty());

        // Any authenticated request (not only /auth/me) stamps activity, without touching other columns.
        String token = JsonPath.read(mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"%s\",\"password\":\"Parol2026\"}".formatted(email)))
                .andReturn().getResponse().getContentAsString(), "$.accessToken");
        uz.unikompas.user.User stale = users.findByEmail(email).orElseThrow();
        String hashBefore = stale.getPasswordHash();
        org.springframework.test.util.ReflectionTestUtils.setField(stale, "lastSeenAt", null);
        users.saveAndFlush(stale);
        mvc.perform(get("/api/v1/favorites").header("Authorization", "Bearer " + token)).andExpect(status().isOk());
        uz.unikompas.user.User after = users.findByEmail(email).orElseThrow();
        org.assertj.core.api.Assertions.assertThat(after.getLastSeenAt()).isNotNull();
        org.assertj.core.api.Assertions.assertThat(after.getPasswordHash()).isEqualTo(hashBefore);

        // Sorting by last activity keeps never-seen users at the end.
        users.saveAndFlush(new uz.unikompas.user.User("Never Seen", "never-" + UUID.randomUUID() + "@x.uz", "h",
                uz.unikompas.user.Role.APPLICANT));
        String body = mvc.perform(get("/api/v1/admin/users").param("role", "APPLICANT").param("size", "100")
                        .param("sort", "lastSeenAt,desc").header("Authorization", admin))
                .andReturn().getResponse().getContentAsString();
        java.util.List<String> seen = JsonPath.read(body, "$.content[*].lastSeenAt");
        int firstNull = seen.indexOf(null);
        org.assertj.core.api.Assertions.assertThat(firstNull).isPositive();
        org.assertj.core.api.Assertions.assertThat(seen.subList(firstNull, seen.size())).containsOnlyNulls();

        mvc.perform(get("/api/v1/admin/stats").header("Authorization", admin))
                .andExpect(jsonPath("$.activeLast24h", greaterThan(0)))
                .andExpect(jsonPath("$.activeLast7d", greaterThan(0)));
    }

    @Test
    void shouldReturnStatsAndUsers() throws Exception {
        applicant();
        mvc.perform(get("/api/v1/admin/stats").header("Authorization", admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.applicants", greaterThan(0)))
                .andExpect(jsonPath("$.catalog.universities", greaterThan(0)));
        mvc.perform(get("/api/v1/admin/users").param("role", "ADMIN").header("Authorization", admin))
                .andExpect(jsonPath("$.content[*].role", everyItem(is("ADMIN"))))
                .andExpect(jsonPath("$.content[0].passwordHash").doesNotExist());
    }
}
