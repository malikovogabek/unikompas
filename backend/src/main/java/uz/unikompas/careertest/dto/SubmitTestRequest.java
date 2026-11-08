package uz.unikompas.careertest.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

/** All answers of one questionnaire run (every question exactly once). */
public record SubmitTestRequest(@NotEmpty List<@Valid @NotNull Answer> answers) {

    public record Answer(@NotNull Long questionId, @NotNull @Min(1) @Max(5) Integer value) {
    }
}
