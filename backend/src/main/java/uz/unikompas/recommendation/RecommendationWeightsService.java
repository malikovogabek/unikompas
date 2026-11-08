package uz.unikompas.recommendation;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.unikompas.settings.AppSetting;
import uz.unikompas.settings.AppSettingRepository;

/**
 * Reads the algorithm weights from {@code app_settings} (FR-8.6). Falls back to
 * {@link RecommendationWeights#DEFAULT} if a key is missing or the stored set is invalid.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationWeightsService {

    static final String INTEREST = "recommendation.weight.interest";
    static final String CHANCE = "recommendation.weight.chance";
    static final String PREFERENCE = "recommendation.weight.preference";
    static final String RATING = "recommendation.weight.rating";

    private final AppSettingRepository settings;

    @Transactional(readOnly = true)
    public RecommendationWeights current() {
        Map<String, String> values = settings.findAllById(java.util.List.of(INTEREST, CHANCE, PREFERENCE, RATING))
                .stream().collect(Collectors.toMap(AppSetting::getKey, AppSetting::getValue));
        try {
            Function<String, Double> get = key -> Double.parseDouble(values.get(key));
            return new RecommendationWeights(get.apply(INTEREST), get.apply(CHANCE),
                    get.apply(PREFERENCE), get.apply(RATING));
        } catch (RuntimeException e) {
            log.warn("Invalid or missing recommendation weights in app_settings, using defaults: {}", e.getMessage());
            return RecommendationWeights.DEFAULT;
        }
    }
}
