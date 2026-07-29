import { Volunteer, Team, EventControl, Notification, AuditLog } from '@/types';

// ── Default Event Controls ────────────────────────────────────────────────────
export const DEFAULT_EVENT_CONTROLS: EventControl[] = [
  {
    id: 'quiz',
    name: 'Quiz',
    description: 'Quick-fire questions on IEEE history and core engineering concepts. One device per team.',
    status: 'Coming Soon',
    startTime: null,
    endTime: null,
    isPaused: false,
    url: null,
    order: 1,
  },
  {
    id: 'pitch',
    name: 'Pitch the Product',
    description: 'Teams pitch their prototype to a panel of judges. Judges evaluate and submit marks.',
    status: 'Coming Soon',
    startTime: null,
    endTime: null,
    isPaused: false,
    url: null,
    order: 2,
  },
  {
    id: 'sell',
    name: 'Sell the Product',
    description: 'Teams are assigned products to sell. Sales are recorded and profit is calculated.',
    status: 'Coming Soon',
    startTime: null,
    endTime: null,
    isPaused: false,
    url: null,
    order: 3,
  },
  {
    id: 'treasureHunt',
    name: 'Treasure Hunt',
    description: 'Teams solve campus clues and navigate coordinates to locate hidden treasures.',
    status: 'Coming Soon',
    startTime: null,
    endTime: null,
    isPaused: false,
    url: null,
    order: 4,
  },
];

// ── Generate Default Sandbox State ───────────────────────────────────────────
export const generateDefaultState = () => {
  // Pre-seed volunteers for testing
  const volunteers: Record<string, Volunteer> = {
    vol_approved: {
      uid: 'vol_approved',
      name: 'Priya Nair',
      email: 'volunteer1@zerone.org',
      phone: '9876543210',
      password: 'password',
      department: 'Computer Science',
      status: 'approved',
      assignedTeamId: 'ZR-7001',
      joinCode: 'VOL-1001',
      role: 'volunteer',
      createdAt: new Date().toISOString(),
    },
    vol_pending: {
      uid: 'vol_pending',
      name: 'Arjun Menon',
      email: 'volunteer2@zerone.org',
      phone: '8765432109',
      password: 'password',
      department: 'Information Technology',
      status: 'pending',
      assignedTeamId: null,
      joinCode: 'VOL-1002',
      role: 'volunteer',
      createdAt: new Date().toISOString(),
    },
    vol_approved2: {
      uid: 'vol_approved2',
      name: 'Meera Krishnan',
      email: 'volunteer3@zerone.org',
      phone: '9123456780',
      password: 'password',
      department: 'Electronics',
      status: 'approved',
      assignedTeamId: 'ZR-7002',
      joinCode: 'VOL-1003',
      role: 'volunteer',
      createdAt: new Date().toISOString(),
    },
  };

  // Pre-seed some demo teams
  const teams: Record<string, Team> = {
    'ZR-7001': {
      id: 'ZR-7001',
      name: 'Circuit Breakers',
      volunteerId: 'vol_approved',
      volunteerName: 'Priya Nair',
      members: [
        { id: 'ZR-P-001', name: 'Arun Kumar', department: 'CSE', teamId: 'ZR-7001' },
        { id: 'ZR-P-002', name: 'Divya Raj', department: 'ECE', teamId: 'ZR-7001' },
        { id: 'ZR-P-003', name: 'Sanjay Pillai', department: 'IT', teamId: 'ZR-7001' },
        { id: 'ZR-P-004', name: 'Fathima Beevi', department: 'CSE', teamId: 'ZR-7001' },
      ],
      scores: { quiz: 85, pitch: 72, sell: 90, treasureHunt: 68, bonus: 10, penalty: 0 },
      totalScore: 325,
      rank: 1,
      registrationTime: new Date(Date.now() - 3600000).toISOString(),
      currentEvent: 'Treasure Hunt',
      eventStatus: 'Active',
    },
    'ZR-7002': {
      id: 'ZR-7002',
      name: 'Voltage Squad',
      volunteerId: 'vol_approved2',
      volunteerName: 'Meera Krishnan',
      members: [
        { id: 'ZR-P-005', name: 'Rahul Varma', department: 'Mech', teamId: 'ZR-7002' },
        { id: 'ZR-P-006', name: 'Sneha Anil', department: 'CSE', teamId: 'ZR-7002' },
        { id: 'ZR-P-007', name: 'Akhil Thomas', department: 'IT', teamId: 'ZR-7002' },
      ],
      scores: { quiz: 78, pitch: 80, sell: 75, treasureHunt: 55, bonus: 5, penalty: 5 },
      totalScore: 288,
      rank: 2,
      registrationTime: new Date(Date.now() - 3200000).toISOString(),
      currentEvent: 'Treasure Hunt',
      eventStatus: 'Active',
    },
    'ZR-7003': {
      id: 'ZR-7003',
      name: 'Data Drifters',
      volunteerId: 'vol_approved',
      volunteerName: 'Priya Nair',
      members: [
        { id: 'ZR-P-008', name: 'Kiran Sasi', department: 'ECE', teamId: 'ZR-7003' },
        { id: 'ZR-P-009', name: 'Amitha Suresh', department: 'CSE', teamId: 'ZR-7003' },
      ],
      scores: { quiz: 60, pitch: 55, sell: 70, treasureHunt: 40, bonus: 0, penalty: 10 },
      totalScore: 215,
      rank: 3,
      registrationTime: new Date(Date.now() - 2800000).toISOString(),
      currentEvent: 'Sell the Product',
      eventStatus: 'Coming Soon',
    },
  };

  const eventControls = DEFAULT_EVENT_CONTROLS;

  const notifications: Notification[] = [];

  const auditLogs: AuditLog[] = [
    {
      id: 'init_log_001',
      type: 'admin',
      message: `[${new Date().toTimeString().slice(0,8)}] IEEE ZERONE 7.0 Main Platform initialized. All systems nominal.`,
      timestamp: new Date().toISOString(),
    },
    {
      id: 'init_log_002',
      type: 'team',
      message: `[${new Date().toTimeString().slice(0,8)}] Demo team "Circuit Breakers" (ZR-7001) registered by volunteer Priya Nair.`,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'init_log_003',
      type: 'team',
      message: `[${new Date().toTimeString().slice(0,8)}] Demo team "Voltage Squad" (ZR-7002) registered by volunteer Meera Krishnan.`,
      timestamp: new Date(Date.now() - 3200000).toISOString(),
    },
  ];

  return {
    volunteers,
    teams,
    eventControls,
    notifications,
    auditLogs,
  };
};
