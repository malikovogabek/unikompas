package uz.unikompas.university.dto;

import uz.unikompas.reference.dto.RefResponse;
import uz.unikompas.university.University;
import uz.unikompas.university.UniversityType;

/** University card in catalog lists. */
public record UniversityResponse(
        Long id, String name, String shortName, RefResponse region, String city,
        UniversityType type, int rating, boolean hasDormitory, String logoUrl) {

    public static UniversityResponse from(University u) {
        return new UniversityResponse(u.getId(), u.getName(), u.getShortName(), RefResponse.of(u.getRegion()),
                u.getCity(), u.getType(), u.getRating(), u.isHasDormitory(), u.getLogoUrl());
    }
}
