package uz.unikompas.health;

import java.util.Map;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Liveness probe that deliberately does NOT touch the database. Used by the platform health
 * check, the keep-alive job and the frontend warm-up: none of them should wake the serverless
 * Postgres (Neon) or burn its free compute hours.
 */
@Tag(name = "Health", description = "Server holati (bazaga murojaat qilmaydi)")
@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    private static final Map<String, String> UP = Map.of("status", "UP");

    @Operation(summary = "Server holati",
            description = "Ilova ishlayotganini bildiradi. Ma’lumotlar bazasiga murojaat qilmaydi — Render health "
                    + "check, keep-alive va frontend “uyg‘otish” so‘rovlari uchun.")
    @ApiResponse(responseCode = "200", description = "{\"status\":\"UP\"}")
    @GetMapping
    public Map<String, String> health() {
        return UP;
    }
}
