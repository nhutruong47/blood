package com.nhutruong.blood.shared.security;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.PARAMETER;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

/**
 * Enforces the project's password policy.
 *
 * <ul>
 *   <li>Minimum 12 characters</li>
 *   <li>At least one uppercase letter</li>
 *   <li>At least one lowercase letter</li>
 *   <li>At least one digit</li>
 *   <li>At least one symbol</li>
 *   <li>No whitespace</li>
 * </ul>
 */
@Documented
@Constraint(validatedBy = StrongPasswordValidator.class)
@Target({FIELD, PARAMETER})
@Retention(RUNTIME)
public @interface StrongPassword {
    String message() default "Password must be at least 12 characters and include upper, lower, digit, and symbol characters";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
