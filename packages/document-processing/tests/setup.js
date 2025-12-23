// Jest setup file for document-processing tests

// Set test timeout for long-running OCR operations
jest.setTimeout(600000);

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test helpers
global.testData = {
  sampleTranscriptText: `
OFFICIAL TRANSCRIPT
Student Name: John A. Smith
Student ID: 123456789

Cumulative GPA: 3.75
Total Credits: 120

Term: Fall 2024
CS 1010  Introduction to Programming          A  4.0
MATH 1200 Calculus I                          B+ 4.0
ENGL 1010 Composition                         A- 3.0

Term: Spring 2024
CS 2010  Data Structures                      A  4.0
MATH 2300 Linear Algebra                      B  3.0
PHYS 1010 Physics I                           A- 4.0
  `.trim(),

  sampleEdiText: `
HDR*123456789*OFFICIAL TRANSCRIPT**20241220~
BAT*FALL 2024*120~
ELMT*CS 1010**Introduction to Programming*A*4.0*4.0~
ELMT*MATH 1200**Calculus I*B+*3.7*4.0~
ELMT*ENGL 1010**Composition*A-*3.7*3.0~
STC*3*12.0*11.4~
  `.trim(),

  lowQualityText: `
        OFFICIAL TRANSCRIPT

Student Name: J0hn A. Sm1th
Student ID: 123456789

Cumulative GPA: 3.75
Total Credits: 120

CS 1010  Intr0ducti0n t0 Pr0gramming   A  4.0
  `.trim(),

  emptyText: "",
  shortText: "Test",
};
