package uz.unikompas.direction.dto;

import uz.unikompas.careertest.Riasec;
import uz.unikompas.direction.Direction;
import uz.unikompas.reference.dto.RefResponse;

/** Full direction page (FR-5.4): description, careers and the RIASEC profile. */
public record DirectionDetailsResponse(
        Long id, String code, String name, RefResponse field, RefResponse firstSubject, RefResponse secondSubject,
        RiasecProfile riasec, String hollandCode, String description, String careerProspects,
        long programCount) {

    public static DirectionDetailsResponse from(Direction d, long programCount) {
        return new DirectionDetailsResponse(d.getId(), d.getCode(), d.getName(), RefResponse.of(d.getField()),
                RefResponse.of(d.getFirstSubject()), RefResponse.of(d.getSecondSubject()),
                new RiasecProfile(d.getRiasecR(), d.getRiasecI(), d.getRiasecA(),
                        d.getRiasecS(), d.getRiasecE(), d.getRiasecC()),
                Riasec.hollandCode(d.riasecVector()), d.getDescription(), d.getCareerProspects(), programCount);
    }
}
