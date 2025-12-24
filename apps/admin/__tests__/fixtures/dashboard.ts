/**
 * Dashboard Fixtures
 * 
 * FERPA-Compliant Test Data
 * All test data uses synthetic, non-identifiable information.
 * No real student data is used in testing.
 */

export interface DashboardMetrics {
  pendingEvaluations: number;
  completedToday: number;
  atRiskStudents: number;
  totalStudents: number;
  eligibleStudents: number;
  ineligibleStudents: number;
  averageProcessingTime: number;
}

export interface ActivityItem {
  id: string;
  studentName: string;
  action: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'at-risk';
}

export interface DashboardResponse {
  metrics: DashboardMetrics;
  recentActivities: ActivityItem[];
  trends: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
}

export const mockDashboardMetrics: DashboardMetrics = {
  pendingEvaluations: 23,
  completedToday: 12,
  atRiskStudents: 8,
  totalStudents: 150,
  eligibleStudents: 120,
  ineligibleStudents: 30,
  averageProcessingTime: 4.5
};

export const mockRecentActivities: ActivityItem[] = [
  {
    id: '1',
    studentName: 'Testington, Alex',
    action: 'Transcript uploaded',
    timestamp: '2 minutes ago',
    status: 'pending'
  },
  {
    id: '2',
    studentName: 'Testerson, Jordan',
    action: 'Eligibility completed',
    timestamp: '15 minutes ago',
    status: 'completed'
  },
  {
    id: '3',
    studentName: 'Testwell, Taylor',
    action: 'Course mapping updated',
    timestamp: '1 hour ago',
    status: 'completed'
  },
  {
    id: '4',
    studentName: 'Testfield, Morgan',
    action: 'Transcript flagged',
    timestamp: '2 hours ago',
    status: 'at-risk'
  },
  {
    id: '5',
    studentName: 'Testworth, Casey',
    action: 'Transcript uploaded',
    timestamp: '3 hours ago',
    status: 'pending'
  },
  {
    id: '6',
    studentName: 'Testson, Riley',
    action: 'Eligibility completed',
    timestamp: '4 hours ago',
    status: 'completed'
  },
  {
    id: '7',
    studentName: 'Testington, Alex',
    action: 'Course mapping updated',
    timestamp: '5 hours ago',
    status: 'completed'
  },
  {
    id: '8',
    studentName: 'Testerson, Jordan',
    action: 'Transcript flagged',
    timestamp: '6 hours ago',
    status: 'at-risk'
  },
  {
    id: '9',
    studentName: 'Testwell, Taylor',
    action: 'Transcript uploaded',
    timestamp: '7 hours ago',
    status: 'pending'
  },
  {
    id: '10',
    studentName: 'Testfield, Morgan',
    action: 'Eligibility completed',
    timestamp: '8 hours ago',
    status: 'completed'
  }
];

export const mockDashboardResponse: DashboardResponse = {
  metrics: mockDashboardMetrics,
  recentActivities: mockRecentActivities,
  trends: {
    daily: [15, 18, 12, 20, 23, 19, 17],
    weekly: [85, 92, 88, 95, 90, 87, 91],
    monthly: [320, 350, 340, 360, 355, 345, 358]
  }
};

export const mockFilteredDashboardResponse: DashboardResponse = {
  metrics: {
    ...mockDashboardMetrics,
    pendingEvaluations: 5,
    completedToday: 3,
    atRiskStudents: 2
  },
  recentActivities: mockRecentActivities.filter(a => a.status === 'pending'),
  trends: mockDashboardResponse.trends
};

export const mockEmptyDashboardResponse: DashboardResponse = {
  metrics: {
    pendingEvaluations: 0,
    completedToday: 0,
    atRiskStudents: 0,
    totalStudents: 0,
    eligibleStudents: 0,
    ineligibleStudents: 0,
    averageProcessingTime: 0
  },
  recentActivities: [],
  trends: {
    daily: [],
    weekly: [],
    monthly: []
  }
};
