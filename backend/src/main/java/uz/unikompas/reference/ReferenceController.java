package uz.unikompas.reference;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.unikompas.reference.dto.RefResponse;

/**
 * Public reference lists used by filters and forms. Trivial reads, so no service layer.
 */
@Tag(name = "Ma’lumotnomalar", description = "Hududlar, test fanlari va bilim sohalari")
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReferenceController {

    private final RegionRepository regions;
    private final SubjectRepository subjects;
    private final FieldRepository fields;

    /** Lists the 14 administrative regions of Uzbekistan. */
    @Operation(summary = "Hududlar ro‘yxati",
            description = "12 viloyat, Qoraqalpog‘iston Respublikasi va Toshkent shahri. "
                    + "Profil formasi va OTM filtrida ishlatiladi. `code` — tarjima kaliti.")
    @GetMapping("/regions")
    public List<RefResponse> regions() {
        return regions.findAll(Sort.by("id")).stream().map(RefResponse::of).toList();
    }

    /** Lists the specialised test subjects that form a subject pair. */
    @Operation(summary = "Test fanlari ro‘yxati",
            description = "Abituriyent fanlar majmuasini (1-fan va 2-fan) tanlashi uchun fanlar.")
    @GetMapping("/subjects")
    public List<RefResponse> subjects() {
        return subjects.findAll(Sort.by("id")).stream().map(RefResponse::of).toList();
    }

    /** Lists knowledge areas with their UI icon names. */
    @Operation(summary = "Bilim sohalari ro‘yxati",
            description = "IT, tibbiyot, iqtisodiyot va boshqa sohalar (ikonka nomi bilan). "
                    + "Yo‘nalishlar filtri va profildagi qiziqishlar uchun.")
    @GetMapping("/fields")
    public List<RefResponse> fields() {
        return fields.findAll(Sort.by("id")).stream().map(RefResponse::of).toList();
    }
}
