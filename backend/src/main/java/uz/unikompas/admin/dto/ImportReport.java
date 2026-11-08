package uz.unikompas.admin.dto;

import java.util.List;

/**
 * Result of a CSV import (FR-8.5): valid rows are saved, invalid ones are listed
 * with their line number and an error code the UI translates ({@code importErrors.<CODE>}).
 */
public record ImportReport(int totalRows, int created, int updated, List<RowError> errors) {

    public record RowError(int line, String code, String value) {
    }
}
