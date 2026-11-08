package uz.unikompas.recommendation;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Registers the framework-free {@link RecommendationEngine} as a Spring bean.
 */
@Configuration
class RecommendationConfig {

    @Bean
    RecommendationEngine recommendationEngine() {
        return new RecommendationEngine();
    }
}
