package uz.unikompas.common.exception;

/**
 * Thrown when a requested entity does not exist (HTTP 404).
 */
public class NotFoundException extends ApiException {

    public NotFoundException(String entity, Object id) {
        super(ErrorCode.NOT_FOUND, entity + " not found: " + id);
    }
}
