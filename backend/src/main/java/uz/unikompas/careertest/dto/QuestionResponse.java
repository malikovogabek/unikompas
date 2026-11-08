package uz.unikompas.careertest.dto;

import uz.unikompas.careertest.CareerQuestion;

/**
 * Questionnaire item with all translations; the RIASEC type is intentionally hidden
 * so answers are not steered.
 */
public record QuestionResponse(Long id, int orderNo, Texts text) {

    public record Texts(String uz, String ru, String en) {
    }

    public static QuestionResponse from(CareerQuestion q) {
        return new QuestionResponse(q.getId(), q.getOrderNo(), new Texts(q.getTextUz(), q.getTextRu(), q.getTextEn()));
    }
}
