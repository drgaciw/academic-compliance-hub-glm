/**
 * TestSprite Configuration
 *
 * This configuration file sets up TestSprite for automated test generation
 * and execution for the Academic Compliance Hub frontend codebase.
 */

export default {
  projectName: 'academic-compliance-hub-glm',
  projectPath: process.cwd(),
  
  // Frontend configuration
  frontend: {
    type: 'frontend',
    localPort: 3000,
    pathname: '',
    testScope: 'codebase',
    
    // Test frameworks
    frameworks: {
      unit: 'vitest',
      integration: 'vitest',
      e2e: 'playwright'
    },
    
    // Critical paths to test
    criticalPaths: [
      '/compliance/dashboard',
      '/transcripts/upload',
      '/eligibility/review',
      '/compliance/course-mapping',
      '/compliance/audit-trail',
      '/transcripts/upload/batch'
    ],
    
    // Components to test
    components: [
      'Button',
      'Card',
      'Dialog',
      'Input',
      'Label',
      'Select',
      'Tabs',
      'DropdownMenu'
    ],
    
    // Testing considerations
    considerations: {
      accessibility: 'WCAG 2.1 Level AA',
      compliance: 'FERPA',
      responsive: true,
      performance: 'Core Web Vitals'
    }
  },
  
  // Backend configuration
  backend: {
    type: 'backend',
    testScope: 'codebase',
    
    // API endpoints to test
    endpoints: [
      '/api/transcripts/*',
      '/api/eligibility/*',
      '/api/course-mapping/*',
      '/api/auth/*'
    ]
  },
  
  // Test generation settings
  generation: {
    // Include login in tests
    needLogin: true,
    
    // Test IDs to generate (empty = all)
    testIds: [],
    
    // Additional instructions for test generation
    additionalInstruction: `
      Focus on:
      1. FERPA compliance - ensure student data is protected
      2. Accessibility - test with screen readers and keyboard navigation
      3. Error handling - test all error states
      4. Edge cases - large files, invalid data, network failures
      5. Performance - measure Core Web Vitals
      
      Coverage Targets:
      - Components: 90%+
      - Hooks: 95%+
      - Utilities: 100%
      - Services: 85%+
      - Overall: 90%
    `
  }
}
