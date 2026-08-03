# Baseline Before Fix

Date: 2026-08-04 01:35-01:36 Asia/Bangkok
Repository checked: `D:\d\1\blood`
Spring project root: `D:\d\1\blood\blood`
Branch before fix: `b-Nhu`
Working branch created: `fix/security-workflow-cleanup`

## Git Status Before Fix

```text
M  blood/src/main/java/com/nhutruong/blood/BloodApplication.java
M  blood/src/main/java/com/nhutruong/blood/entity/DonationRegistration.java
```

## Dirty Files Before Fix

These changes existed before this implementation and were preserved:

```diff
diff --git a/blood/src/main/java/com/nhutruong/blood/BloodApplication.java b/blood/src/main/java/com/nhutruong/blood/BloodApplication.java
-        System.out.println("helo world");
+

diff --git a/blood/src/main/java/com/nhutruong/blood/entity/DonationRegistration.java b/blood/src/main/java/com/nhutruong/blood/entity/DonationRegistration.java
+        
```

## Runtime Versions

```text
Java: 21.0.11, Oracle Corporation
Maven: 3.9.10
Spring Boot: 3.5.3
```

## Main Dependencies Before Fix

```text
spring-boot-starter-web
springdoc-openapi-starter-webmvc-ui 2.8.5
lombok
spring-boot-starter-data-jpa
mssql-jdbc 12.6.1.jre11
spring-boot-starter-test
```

## Baseline Build

```text
.\mvnw.cmd -DskipTests package: PASS
.\mvnw.cmd test: FAILED
```

Baseline test failure:

```text
SQL Server login failed for user 'sa'.
The test suite used application.properties directly and required local SQL Server credentials.
```

## Initial Package Structure

```text
controller
entity
exception
repository
service
service/imple
```

## Initial Controllers

```text
AuthController
BloodRequestController
DonationController
DonationLocationController
MedicalCenterController
StaffController
```

## Initial Services

```text
AuthService / AuthServiceImple
BloodRequestService / BloodRequestServiceImple
DonationService / DonationServiceImple
```

## Initial Repositories

```text
UserRepository
BloodRequestRepository
DonationLocationRepository
DonationScheduleRepository
DonationRegistrationRepository
```

## Initial Entities

```text
User
Role
BloodRequest
DonationLocation
DonationSchedule
DonationRegistration
```
