package uz.unikompas.careertest;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CareerQuestionRepository extends JpaRepository<CareerQuestion, Long> {

    List<CareerQuestion> findAllByOrderByOrderNoAsc();
}
