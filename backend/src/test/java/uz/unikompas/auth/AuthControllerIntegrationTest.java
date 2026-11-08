package uz.unikompas.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import uz.unikompas.support.IntegrationTest;
import uz.unikompas.user.Role;
import uz.unikompas.user.User;
import uz.unikompas.user.UserRepository;

@IntegrationTest
class AuthControllerIntegrationTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    UserRepository users;

    @Test
    void shouldRegisterLoginAndReturnCurrentUser() throws Exception {
        mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content("""
                        {"fullName":"Test User","email":"  Flow@Example.com ","password":"Parol2026"}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("flow@example.com"))
                .andExpect(jsonPath("$.user.role").value("APPLICANT"));

        String body = mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content("""
                        {"email":"FLOW@example.com","password":"Parol2026"}"""))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String token = JsonPath.read(body, "$.accessToken");

        mvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Test User"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void shouldRejectDuplicateEmail() throws Exception {
        String json = """
                {"fullName":"Dup User","email":"dup@example.com","password":"Parol2026"}""";
        mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("EMAIL_TAKEN"));
    }

    @Test
    void shouldReturnFieldErrorCodes_whenPayloadInvalid() throws Exception {
        mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content("""
                        {"fullName":"","email":"not-an-email","password":"short"}"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors.email").value("Email"))
                .andExpect(jsonPath("$.fieldErrors.fullName").exists())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    @Test
    void shouldReturnSameError_forUnknownEmailAndWrongPassword() throws Exception {
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content("""
                        {"email":"nobody@example.com","password":"whatever1"}"""))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("INVALID_CREDENTIALS"));
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content("""
                        {"email":"admin@test.uz","password":"WrongPass1"}"""))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("INVALID_CREDENTIALS"));
    }

    @Test
    void shouldLoginBootstrapAdmin() throws Exception {
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content("""
                        {"email":"admin@test.uz","password":"Admin123!"}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.role").value("ADMIN"));
    }

    @Test
    void shouldReturnUnauthorizedJson_whenTokenMissingOrInvalid() throws Exception {
        mvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("UNAUTHORIZED"));
        mvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer not.a.jwt"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("UNAUTHORIZED"));
    }

    @Test
    void shouldRejectPasswordOver72Bytes_withValidationError() throws Exception {
        String cyrillic = "Пароль1" + "ж".repeat(40); // 47 chars, 87 UTF-8 bytes
        mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content("""
                        {"fullName":"Rus User","email":"rus@example.com","password":"%s"}""".formatted(cyrillic)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.password").value("MaxBytes"));
    }

    @Test
    void shouldTreatEmailCaseInsensitively_atDatabaseLevel() throws Exception {
        users.saveAndFlush(new User("Raw", "Case@Example.com", "x", Role.APPLICANT));
        mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content("""
                        {"fullName":"Case User","email":"case@example.com","password":"Parol2026"}"""))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("EMAIL_TAKEN"));
    }

    @Test
    void shouldMapFrameworkClientErrorsTo4xx() throws Exception {
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.TEXT_PLAIN).content("x"))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("$.error").value("UNSUPPORTED_MEDIA_TYPE"));
        String body = mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content("""
                        {"email":"admin@test.uz","password":"Admin123!"}"""))
                .andReturn().getResponse().getContentAsString();
        String token = JsonPath.read(body, "$.accessToken");
        // Authenticated, so the request reaches MVC and fails on the HTTP method, not on security.
        mvc.perform(get("/api/v1/auth/login").header("Authorization", "Bearer " + token))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.error").value("METHOD_NOT_ALLOWED"));
    }

    @Test
    void shouldExposeSwaggerPublicly() throws Exception {
        mvc.perform(get("/v3/api-docs")).andExpect(status().isOk());
    }
}
