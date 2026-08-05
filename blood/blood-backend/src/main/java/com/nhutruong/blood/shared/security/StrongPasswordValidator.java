package com.nhutruong.blood.shared.security;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {

    private static final int MIN_LENGTH = 12;
    private static final Pattern HAS_UPPER = Pattern.compile("[A-Z]");
    private static final Pattern HAS_LOWER = Pattern.compile("[a-z]");
    private static final Pattern HAS_DIGIT = Pattern.compile("[0-9]");
    private static final Pattern HAS_SYMBOL = Pattern.compile("[^A-Za-z0-9]");
    private static final Pattern HAS_WHITESPACE = Pattern.compile("\\s");

    @Override
    public boolean isValid(String value, ConstraintValidatorContext ctx) {
        if (value == null) {
            return false;
        }
        if (value.length() < MIN_LENGTH) return false;
        if (HAS_WHITESPACE.matcher(value).find()) return false;
        if (!HAS_UPPER.matcher(value).find()) return false;
        if (!HAS_LOWER.matcher(value).find()) return false;
        if (!HAS_DIGIT.matcher(value).find()) return false;
        return HAS_SYMBOL.matcher(value).find();
    }
}
