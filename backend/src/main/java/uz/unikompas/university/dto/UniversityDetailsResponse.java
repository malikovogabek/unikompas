package uz.unikompas.university.dto;

import uz.unikompas.reference.dto.RefResponse;
import uz.unikompas.university.University;
import uz.unikompas.university.UniversityType;

/** Full university page (FR-5.2). */
public record UniversityDetailsResponse(
        Long id, String name, String shortName, RefResponse region, String city, String address,
        String website, UniversityType type, int rating, boolean hasDormitory, Short foundedYear,
        String description, String logoUrl, long programCount) {

    public static UniversityDetailsResponse from(University u, long programCount) {
        return new UniversityDetailsResponse(u.getId(), u.getName(), u.getShortName(), RefResponse.of(u.getRegion()),
                u.getCity(), u.getAddress(), u.getWebsite(), u.getType(), u.getRating(), u.isHasDormitory(),
                u.getFoundedYear(), u.getDescription(), u.getLogoUrl(), programCount);
    }
}
