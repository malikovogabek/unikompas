package uz.unikompas.direction.dto;

import uz.unikompas.direction.Direction;
import uz.unikompas.reference.dto.RefResponse;

/** Direction card in catalog lists; also embedded in program responses. */
public record DirectionResponse(
        Long id, String code, String name, RefResponse field, RefResponse firstSubject, RefResponse secondSubject) {

    public static DirectionResponse from(Direction d) {
        return new DirectionResponse(d.getId(), d.getCode(), d.getName(), RefResponse.of(d.getField()),
                RefResponse.of(d.getFirstSubject()), RefResponse.of(d.getSecondSubject()));
    }
}
