# syntax=docker/dockerfile:1.7
# Multi-stage build for the blood donation backend.

# ---------------------------------------------------------------------------
# Stage 1: dependency cache (rebuilds only when pom.xml changes)
# ---------------------------------------------------------------------------
FROM maven:3.9.6-eclipse-temurin-21-jammy AS deps
WORKDIR /build
COPY pom.xml ./
# Resolve dependencies once and cache them in the local repo. This layer is
# invalidated only when pom.xml changes, so source-only edits skip downloads.
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B -q -e -ntp dependency:go-offline

# ---------------------------------------------------------------------------
# Stage 2: build the executable jar
# ---------------------------------------------------------------------------
FROM deps AS builder
WORKDIR /build
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B -q -e -ntp -DskipTests package

# ---------------------------------------------------------------------------
# Stage 3: minimal runtime image
# ---------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-jammy AS runtime

# Run as a non-root user so the container doesn't have root inside the JVM.
RUN groupadd --system --gid 1001 app \
    && useradd  --system --uid 1001 --gid app --create-home --shell /sbin/nologin app

WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar

USER app

# Container-level JVM settings: container-aware memory, exit on OOM, sane defaults.
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError -XX:+HeapDumpOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080

# Spring Boot has graceful shutdown built in (server.shutdown=graceful).
# HEALTHCHECK hits the liveness probe every 30s; Docker restarts the
# container after three failed probes (90s).
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health/liveness || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
