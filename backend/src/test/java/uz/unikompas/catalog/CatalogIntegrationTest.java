package uz.unikompas.catalog;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import uz.unikompas.support.IntegrationTest;

/**
 * Public catalog endpoints against the demo catalog (db/demo). Assertions avoid exact
 * demo numbers where possible so the seed can evolve without breaking tests.
 */
@IntegrationTest
class CatalogIntegrationTest {

    @Autowired
    MockMvc mvc;

    @Test
    void shouldListReferenceDataWithoutAuth() throws Exception {
        mvc.perform(get("/api/v1/regions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(14)))
                .andExpect(jsonPath("$[0].code").value("TASHKENT_CITY"));
        mvc.perform(get("/api/v1/subjects")).andExpect(status().isOk()).andExpect(jsonPath("$[0].code").value("MATH"));
        mvc.perform(get("/api/v1/fields")).andExpect(status().isOk()).andExpect(jsonPath("$[0].icon").isNotEmpty());
    }

    @Test
    void shouldFilterUniversitiesByRegionTypeAndSearch() throws Exception {
        mvc.perform(get("/api/v1/universities").param("regionId", "6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].region.code", everyItem(is("SAMARKAND"))))
                .andExpect(jsonPath("$.totalElements", greaterThan(0)));
        mvc.perform(get("/api/v1/universities").param("type", "FOREIGN_BRANCH"))
                .andExpect(jsonPath("$.content[*].type", everyItem(is("FOREIGN_BRANCH"))));
        mvc.perform(get("/api/v1/universities").param("search", "TATU"))
                .andExpect(jsonPath("$.content[0].shortName").value("TATU"));
    }

    @Test
    void shouldSortUniversitiesByRatingDescByDefault() throws Exception {
        mvc.perform(get("/api/v1/universities").param("size", "2"))
                .andExpect(jsonPath("$.size").value(2))
                .andExpect(jsonPath("$.content[0].rating").value(92));
    }

    @Test
    void shouldRejectUnknownSortProperty() throws Exception {
        mvc.perform(get("/api/v1/universities").param("sort", "passwordHash"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("MALFORMED_REQUEST"));
    }

    @Test
    void shouldReturnUniversityDetailsAndPrograms() throws Exception {
        mvc.perform(get("/api/v1/universities/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.programCount", greaterThan(0)));
        mvc.perform(get("/api/v1/universities/1/programs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].scoreHistory", hasSize(3)))
                .andExpect(jsonPath("$[0].latestScores.year").value(2026));
        mvc.perform(get("/api/v1/universities/9999")).andExpect(status().isNotFound());
        mvc.perform(get("/api/v1/universities/9999/programs")).andExpect(status().isNotFound());
    }

    @Test
    void shouldFilterDirectionsBySubjectPair() throws Exception {
        mvc.perform(get("/api/v1/directions").param("subjectId1", "4").param("subjectId2", "3").param("size", "50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].firstSubject.code", everyItem(is("BIOLOGY"))))
                .andExpect(jsonPath("$.content[*].secondSubject.code", everyItem(is("CHEMISTRY"))));
    }

    @Test
    void shouldReturnDirectionDetailsWithHollandCode() throws Exception {
        mvc.perform(get("/api/v1/directions").param("search", "60610100"))
                .andExpect(jsonPath("$.content[0].code").value("60610100"));
        mvc.perform(get("/api/v1/directions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hollandCode").value("ICR"))
                .andExpect(jsonPath("$.riasec.i").value(9));
    }

    @Test
    void shouldHideGrantScoresWhereNoGrantQuota() throws Exception {
        // Foreign branches have contract places only.
        mvc.perform(get("/api/v1/universities").param("search", "WIUT"))
                .andExpect(jsonPath("$.content[0].shortName").value("WIUT"));
        mvc.perform(get("/api/v1/universities/7/programs"))
                .andExpect(jsonPath("$[*].grantQuota", everyItem(is(0))))
                .andExpect(jsonPath("$[0].latestScores.grantScore").doesNotExist());
    }

    @Test
    void shouldCompareTwoToFourPrograms() throws Exception {
        mvc.perform(get("/api/v1/programs/compare").param("ids", "3,1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(3))
                .andExpect(jsonPath("$[1].id").value(1));
        mvc.perform(get("/api/v1/programs/compare").param("ids", "1,1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
        mvc.perform(get("/api/v1/programs/compare").param("ids", "1,2,3,4,5"))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/v1/programs/compare").param("ids", "1,99999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldCalculateScore() throws Exception {
        mvc.perform(post("/api/v1/score/calculate").contentType(MediaType.APPLICATION_JSON).content("""
                        {"mandatoryCorrect":24,"firstSubjectCorrect":26,"secondSubjectCorrect":22}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(153.2))
                .andExpect(jsonPath("$.maxTotal").value(189.0));
        mvc.perform(post("/api/v1/score/calculate").contentType(MediaType.APPLICATION_JSON).content("""
                        {"mandatoryCorrect":31,"firstSubjectCorrect":0}"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.mandatoryCorrect").value("Max"))
                .andExpect(jsonPath("$.fieldErrors.secondSubjectCorrect").value("NotNull"));
    }

    @Test
    void shouldKeepWriteMethodsProtected() throws Exception {
        mvc.perform(post("/api/v1/universities").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
    }
}
