package uz.unikompas.favorite;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.unikompas.common.dto.PageResponse;
import uz.unikompas.common.dto.Pageables;
import uz.unikompas.common.exception.NotFoundException;
import uz.unikompas.program.ProgramRepository;
import uz.unikompas.program.ProgramService;
import uz.unikompas.program.dto.ProgramResponse;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favorites;
    private final ProgramRepository programs;
    private final ProgramService programService;

    @Transactional(readOnly = true)
    public PageResponse<ProgramResponse> list(Long userId, Pageable pageable) {
        Page<Favorite> page = favorites.findByUserIdOrderByCreatedAtDescProgramIdAsc(userId, Pageables.unsorted(pageable));
        List<ProgramResponse> content = programService.listInOrder(page.map(Favorite::getProgramId).getContent());
        return new PageResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements(),
                page.getTotalPages());
    }

    /** Idempotent: adding an existing favorite is a no-op. */
    @Transactional
    public void add(Long userId, Long programId) {
        if (!programs.existsById(programId)) {
            throw new NotFoundException("Program", programId);
        }
        favorites.insertIgnoringDuplicate(userId, programId);
    }

    /** Idempotent: removing a missing favorite is a no-op. */
    @Transactional
    public void remove(Long userId, Long programId) {
        favorites.deleteById(new Favorite.Key(userId, programId));
    }
}
