package uz.unikompas.reference;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.unikompas.reference.dto.RefResponse;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReferenceService {

    private static final Sort BY_ID = Sort.by("id");

    private final RegionRepository regions;
    private final SubjectRepository subjects;
    private final FieldRepository fields;

    public List<RefResponse> regions() {
        return regions.findAll(BY_ID).stream().map(RefResponse::of).toList();
    }

    public List<RefResponse> subjects() {
        return subjects.findAll(BY_ID).stream().map(RefResponse::of).toList();
    }

    public List<RefResponse> fields() {
        return fields.findAll(BY_ID).stream().map(RefResponse::of).toList();
    }
}
