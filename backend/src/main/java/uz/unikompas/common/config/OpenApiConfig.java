package uz.unikompas.common.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger UI metadata: {@code http://localhost:8080/swagger-ui.html}.
 * Protected endpoints declare {@code @SecurityRequirement(name = "bearer")}.
 */
@Configuration
@OpenAPIDefinition(info = @Info(
        title = "UniKompas API",
        version = "v1",
        description = "Abituriyentlarga mos ta’lim yo‘nalishlari va OTMlarni tavsiya etish tizimi REST API’si. "
                + "Himoyalangan endpointlar uchun avval /auth/login orqali token oling va “Authorize” tugmasini bosing.",
        contact = @Contact(name = "Og‘abek Malikov", url = "https://github.com/malikovogabek/unikompas")))
@SecurityScheme(name = "bearer", type = SecuritySchemeType.HTTP, scheme = "bearer", bearerFormat = "JWT")
public class OpenApiConfig {
}
