import {
  MonitorSmartphone, Server, Layers, Container, Smartphone, // Roles
  Building2, Rocket, Globe, IndianRupee, Package // Companies
} from 'lucide-react';

/**
 * Application constants.
 */

/** SDE Levels */
export const SDE_LEVELS = [
  { value: 'SDE_1', label: 'SDE-1', description: 'Junior Engineer (0-2 years)', color: '#10B981' },
  { value: 'SDE_2', label: 'SDE-2', description: 'Mid-Level Engineer (2-5 years)', color: '#6366F1' },
  { value: 'SDE_3', label: 'SDE-3', description: 'Senior Engineer (5-8 years)', color: '#F59E0B' },
  { value: 'SDE_4', label: 'SDE-4', description: 'Staff / Principal (8+ years)', color: '#EF4444' },
];

/** Developer Roles */
export const DEV_ROLES = [
  { value: 'FRONTEND', label: 'Frontend', icon: <MonitorSmartphone />, description: 'React, Angular, Vue.js' },
  { value: 'BACKEND', label: 'Backend', icon: <Server />, description: 'Node.js, Python, Java' },
  { value: 'FULL_STACK', label: 'Full Stack', icon: <Layers />, description: 'End to end development' },
  { value: 'DEVOPS', label: 'DevOps', icon: <Container />, description: 'CI/CD, Cloud, Infrastructure' },
  { value: 'MOBILE', label: 'Mobile', icon: <Smartphone />, description: 'React Native, Flutter, Swift' },
];

/** Company Types */
export const COMPANY_TYPES = [
  { value: 'FAANG', label: 'FAANG', description: 'Google, Meta, Amazon, Apple, Netflix', icon: <Building2 /> },
  { value: 'STARTUP', label: 'Startup', description: 'Early stage, fast-paced', icon: <Rocket /> },
  { value: 'MNC', label: 'MNC', description: 'TCS, Infosys, Wipro, Accenture', icon: <Globe /> },
  { value: 'FINTECH', label: 'Fintech', description: 'Razorpay, Zerodha, Paytm', icon: <IndianRupee /> },
  { value: 'PRODUCT', label: 'Product', description: 'Atlassian, Notion, Figma', icon: <Package /> },
];

/** Plan Pricing */
export const PLANS = [
  {
    name: 'FREE',
    price: 0,
    label: 'Free',
    features: ['2 sessions/month', '2 hints/question', 'Basic feedback', 'Community support'],
  },
  {
    name: 'PRO',
    price: 299,
    label: 'Pro',
    popular: true,
    features: ['Unlimited sessions', '4 hints/question', 'Voice analysis', 'Company-specific questions', 'Detailed AI feedback'],
  },
  {
    name: 'PREMIUM',
    price: 599,
    label: 'Premium',
    features: ['Everything in Pro', '8 hints/question', 'Resume tips', 'AI coaching', 'Priority AI processing'],
  },
  {
    name: 'TEAM',
    price: 1499,
    label: 'Team',
    features: ['Everything in Premium', '8 hints/question', 'Admin Dashboard', 'Multiple Users', 'Custom Roles'],
  },
];

/** Round Type Labels */
export const ROUND_LABELS = {
  APTITUDE: 'Aptitude',
  DSA_BASIC: 'DSA (Basic)',
  DSA_MEDIUM: 'DSA (Medium)',
  DSA_HARD: 'DSA (Hard)',
  HR: 'HR',
  LLD: 'Low Level Design',
  HLD: 'High Level Design',
  BEHAVIOURAL: 'Behavioural',
  TECH_FUNDAMENTALS: 'Tech Fundamentals',
  TECH_DEEP_DIVE: 'Tech Deep Dive',
  HIRING_MANAGER: 'Hiring Manager',
};

/** Round Durations (in seconds) */
export const ROUND_DURATIONS = {
  APTITUDE: 900,
  DSA_BASIC: 1500,
  DSA_MEDIUM: 2100,
  DSA_HARD: 2400,
  HR: 900,
  LLD: 1800,
  HLD: 2400,
  BEHAVIOURAL: 1200,
  TECH_FUNDAMENTALS: 1200,
  TECH_DEEP_DIVE: 1500,
  HIRING_MANAGER: 1200,
};

/** Supported coding languages */
export const CODE_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'typescript', label: 'TypeScript' },
];

/** Session status colors */
export const STATUS_COLORS = {
  IN_PROGRESS: '#6366F1',
  COMPLETED: '#10B981',
  ABANDONED: '#EF4444',
  PAUSED: '#F59E0B',
};

/** Score verdict colors */
export const VERDICT_COLORS = {
  Excellent: '#10B981',
  Good: '#6366F1',
  Average: '#F59E0B',
  Poor: '#EF4444',
  Strong: '#10B981',
  'Needs Work': '#EF4444',
};
