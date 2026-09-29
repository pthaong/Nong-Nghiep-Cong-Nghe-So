package com.smartagriculture.backend.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatusCode;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

// Lỗi validation
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<Map<String, Object>> handleValidationException(
        MethodArgumentNotValidException exception) {

    Map<String, Object> response = new HashMap<>();

    Map<String, String> errors = new HashMap<>();

    exception.getBindingResult()
            .getFieldErrors()
            .forEach(error ->
                    errors.put(
                            error.getField(),
                            error.getDefaultMessage()
                    )
            );

    response.put("success", false);
    response.put("message", "Validation failed");
    response.put("errors", errors);

    return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(response);
}

// Lỗi nghiệp vụ
@ExceptionHandler(IllegalArgumentException.class)
public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(
        IllegalArgumentException exception) {

    Map<String, Object> response = new HashMap<>();

    response.put("success", false);
    response.put("message", exception.getMessage());

    return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(response);
}

// Lỗi HTTP 403, 404...
@ExceptionHandler(ResponseStatusException.class)
public ResponseEntity<Map<String, Object>> handleResponseStatusException(
        ResponseStatusException exception) {

    Map<String, Object> response = new HashMap<>();

    response.put("success", false);
    response.put("message", exception.getReason());

    HttpStatusCode status = exception.getStatusCode();

    return ResponseEntity
            .status(status)
            .body(response);
}

// Lỗi không xác định
@ExceptionHandler(Exception.class)
public ResponseEntity<Map<String, Object>> handleException(
        Exception exception) {

    // In lỗi thật ra terminal
    System.err.println("======================================");
    System.err.println("SMART AGRICULTURE - INTERNAL ERROR");
    System.err.println("======================================");

    exception.printStackTrace();

    System.err.println("======================================");

    Map<String, Object> response = new HashMap<>();

    response.put("success", false);
    response.put(
            "message",
            exception.getMessage() != null
                    ? exception.getMessage()
                    : "Internal server error"
    );

    return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(response);
}

}