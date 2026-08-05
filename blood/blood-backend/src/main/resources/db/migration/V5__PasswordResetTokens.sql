-- V5__PasswordResetTokens.sql
-- Password reset token table for secure password recovery flow

CREATE TABLE password_reset_tokens (
    id BIGINT IDENTITY NOT NULL,
    token VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL,
    expiry_date DATETIME2 NOT NULL,
    used BIT NOT NULL DEFAULT 0,
    CONSTRAINT pk_password_reset_tokens PRIMARY KEY (id),
    CONSTRAINT uk_password_reset_tokens_token UNIQUE (token),
    CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_password_reset_token ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_expiry ON password_reset_tokens(expiry_date);

-- Cleanup job: remove expired tokens older than 7 days (run weekly)
-- This is handled by the scheduled job, but the table is ready.
