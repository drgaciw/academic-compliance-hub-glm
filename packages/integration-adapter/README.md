# @aah/integration-adapter

SIS integration adapter framework and interface definitions for the Academic Compliance Hub.

## Overview

This package provides TypeScript interfaces and type definitions for integrating with various Student Information Systems (SIS). It defines a common adapter pattern that can be implemented for different SIS platforms.

## Supported SIS Types

- **BANNER** - Ellucian Banner
- **PEOPLESOFT** - Oracle PeopleSoft
- **COLLEAGUE** - Ellucian Colleague
- **JICS** - Jenzabar Information Campus Solutions
- **WORKDAY** - Workday Student
- **CUSTOM** - Custom SIS implementations

## Interfaces

### SISAdapter

The main interface that all SIS adapters must implement:

```typescript
interface SISAdapter {
  sisType: SISType;
  authenticate(credentials: SISCredentials): Promise<Session>;
  getStudentInfo(session: Session, studentId: string): Promise<StudentInfo>;
  getTranscript(session: Session, studentId: string): Promise<Transcript>;
  getCurrentEnrollments(
    session: Session,
    studentId: string,
  ): Promise<CourseEnrollment[]>;
  getCourseInfo(session: Session, courseId: string): Promise<CourseInfo>;
  validateStudent(session: Session, studentId: string): Promise<boolean>;
  checkHold(session: Session, studentId: string): Promise<boolean>;
  getGradeRecords(
    session: Session,
    studentId: string,
    termCode?: string,
  ): Promise<GradeRecord[]>;
  refreshToken(session: Session): Promise<Session>;
  logout(session: Session): Promise<void>;
  healthCheck(): Promise<boolean>;
}
```

### Type Definitions

- **SISCredentials** - Authentication configuration
- **Session** - Active session details
- **GradeRecord** - Individual grade information
- **Transcript** - Complete transcript data
- **CourseEnrollment** - Current course enrollment
- **StudentInfo** - Student demographics and academic info
- **CourseInfo** - Course details and prerequisites

## Usage

Implement the `SISAdapter` interface for your specific SIS:

```typescript
import {
  SISAdapter,
  SISType,
  SISCredentials,
  Session,
} from "@aah/integration-adapter";

class BannerAdapter implements SISAdapter {
  sisType = SISType.BANNER;

  async authenticate(credentials: SISCredentials): Promise<Session> {
    // Implementation
  }

  // ... implement other methods
}
```
