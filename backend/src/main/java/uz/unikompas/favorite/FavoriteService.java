package uz.unikompas.favorite;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
    public List<ProgramResponse> list(Long userId) {
        List<Long> ids = favorites.findByUserIdOrderByCreatedAtDesc(userId).stream().map(Favorite::getProgramId).toList();
        return programService.listInOrder(ids);
    }

    /** Idempotent: adding an existing favorite is a no-op. */
    @Transactional
    public void add(Long userId, Long programId) {
        if (!programs.existsById(programId)) {
            throw new NotFoundException("Program", programId);
        }
        if (!favorites.existsById(new Favorite.Key(userId, programId))) {
            favorites.save(new Favorite(userId, programId));
        }
    }

    /** Idempotent: removing a missing favorite is a no-op. */
    @Transactional
    public void remove(Long userId, Long programId) {
        favorites.deleteById(new Favorite.Key(userId, programId));
    }
}
