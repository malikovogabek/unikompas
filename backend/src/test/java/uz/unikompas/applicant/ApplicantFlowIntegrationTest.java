package uz.unikompas.applicant;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import uz.unikompas.support.IntegrationTest;

/**
 * End-to-end applicant journey (TZ §4.3): profile → career test → recommendation → favorites.
 */
@IntegrationTest
class ApplicantFlowIntegrationTest {

    private static final String IT_PROFILE = """
            {"regionId":1,"firstSubjectId":1,"secondSubjectId":2,"expectedScore":150.0,
             "financing":"CONTRACT_OK","maxContractFee":20000000,"willingToRelocate":true,"fieldIds":[1]}""";

    @Autowired
    MockMvc mvc;

    private String register() throws Exception {
        String body = mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Flow User","email":"%s@example.com","password":"Parol2026"}"""
                                .formatted(UUID.randomUUID())))
                .andReturn().getResponse().getContentAsString();
        return "Bearer " + JsonPath.read(body, "$.accessToken");
    }

    private String adminToken() throws Exception {
        String body = mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@test.uz\",\"password\":\"Admin123!\"}"))
                .andReturn().getResponse().getContentAsString();
        return "Bearer " + JsonPath.read(body, "$.accessToken");
    }

    @Test
    void shouldReturnEmptyProfileFirst_thenSaveIt() throws Exception {
        String token = register();
        mvc.perform(get("/api/v1/profile/me").header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.complete").value(false));
        mvc.perform(put("/api/v1/profile/me").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON).content(IT_PROFILE))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.complete").value(true))
                .andExpect(jsonPath("$.firstSubject.code").value("MATH"))
                .andExpect(jsonPath("$.fields[0].code").value("IT"));
    }

    @Test
    void shouldValidateProfileReferences() throws Exception {
        String token = register();
        mvc.perform(put("/api/v1/profile/me").header("Authorization", token).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"regionId":99,"firstSubjectId":1,"secondSubjectId":1,"expectedScore":200,
                                 "financing":"GRANT_ONLY","willingToRelocate":true}"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.expectedScore").value("DecimalMax"));
        mvc.perform(put("/api/v1/profile/me").header("Authorization", token).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"regionId":99,"firstSubjectId":1,"secondSubjectId":1,"expectedScore":150,
                                 "financing":"GRANT_ONLY","willingToRelocate":true,"fieldIds":[999]}"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.regionId").value("Exists"))
                .andExpect(jsonPath("$.fieldErrors.secondSubjectId").value("DistinctSubjects"))
                .andExpect(jsonPath("$.fieldErrors.fieldIds").value("Exists"));
    }

    @Test
    void shouldForbidApplicantEndpointsForAdmin() throws Exception {
        mvc.perform(get("/api/v1/profile/me").header("Authorization", adminToken()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("FORBIDDEN"));
    }

    @Test
    void shouldScoreCareerTest() throws Exception {
        String token = register();
        String questions = mvc.perform(get("/api/v1/career-test/questions").header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(36)))
                .andExpect(jsonPath("$[0].text.ru").isNotEmpty())
                .andExpect(jsonPath("$[0].riasecType").doesNotExist())
                .andReturn().getResponse().getContentAsString();
        List<Integer> ids = JsonPath.read(questions, "$[*].id");

        mvc.perform(post("/api/v1/career-test/submit").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON).content(answers(ids.subList(0, 35), 3)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.answers").value("AllQuestionsRequired"));

        mvc.perform(get("/api/v1/career-test/results/latest").header("Authorization", token))
                .andExpect(status().isNotFound());

        mvc.perform(post("/api/v1/career-test/submit").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON).content(answers(ids, 3)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.scores.r").value(0.5))
                .andExpect(jsonPath("$.hollandCode").value("RIA"));
        mvc.perform(get("/api/v1/career-test/results").header("Authorization", token))
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    private static String answers(List<Integer> ids, int value) {
        return ids.stream().map(id -> "{\"questionId\":" + id + ",\"value\":" + value + "}")
                .collect(Collectors.joining(",", "{\"answers\":[", "]}"));
    }

    @Test
    void shouldRequireCompleteProfileForRecommendations() throws Exception {
        mvc.perform(post("/api/v1/recommendations").header("Authorization", register()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("PROFILE_INCOMPLETE"));
    }

    @Test
    void shouldGenerateExplainableRecommendation_andKeepItPrivate() throws Exception {
        String token = register();
        mvc.perform(put("/api/v1/profile/me").header("Authorization", token)
                .contentType(MediaType.APPLICATION_JSON).content(IT_PROFILE)).andExpect(status().isOk());

        String body = mvc.perform(post("/api/v1/recommendations").header("Authorization", token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.usedCareerTest").value(false))
                .andExpect(jsonPath("$.totalMatches", greaterThan(0)))
                .andExpect(jsonPath("$.topDirections[*].direction.firstSubject.code", everyItem(is("MATH"))))
                .andExpect(jsonPath("$.programs.SAFE[0].reasons[0].code").isNotEmpty())
                .andExpect(jsonPath("$.weights.interest").value(0.35))
                .andReturn().getResponse().getContentAsString();
        Integer id = JsonPath.read(body, "$.id");
        Integer total = JsonPath.read(body, "$.totalMatches");

        mvc.perform(get("/api/v1/recommendations/latest").header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.totalMatches").value(total));
        mvc.perform(get("/api/v1/recommendations").header("Authorization", token))
                .andExpect(jsonPath("$.content[0].id").value(id))
                .andExpect(jsonPath("$.content[0].totalMatches").value(total));
        mvc.perform(get("/api/v1/recommendations/" + id).header("Authorization", register()))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldManageFavoritesIdempotently() throws Exception {
        String token = register();
        mvc.perform(put("/api/v1/favorites/1").header("Authorization", token)).andExpect(status().isNoContent());
        mvc.perform(put("/api/v1/favorites/1").header("Authorization", token)).andExpect(status().isNoContent());
        mvc.perform(put("/api/v1/favorites/2").header("Authorization", token)).andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/favorites/ids").header("Authorization", token))
                .andExpect(jsonPath("$", hasSize(2)));
        mvc.perform(get("/api/v1/favorites").header("Authorization", token))
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.totalElements").value(2));
        mvc.perform(delete("/api/v1/favorites/1").header("Authorization", token)).andExpect(status().isNoContent());
        mvc.perform(delete("/api/v1/favorites/1").header("Authorization", token)).andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/favorites").header("Authorization", token))
                .andExpect(jsonPath("$.content[*].id", everyItem(is(2))));
        mvc.perform(put("/api/v1/favorites/99999").header("Authorization", token)).andExpect(status().isNotFound());
    }
}
