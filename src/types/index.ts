export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  rollNo?: string;
  mobile?: string;
  registeredAt: string;
  lastLoginAt?: string;
  loginCount?: number;
  isActive?: boolean;
}

export interface Component {
  id: string;
  name: string;
  totalQuantity: number;
  availableQuantity: number;
  category: string;
  description?: string;
}

export interface BorrowRequest {
  id: string;
  studentId?: string;
  studentName: string;
  rollNo: string;
  mobile: string;
  year: string;
  department: string;
  componentId: string;
  componentName: string;
  quantity: number;
  requestDate: string;
  dueDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'returned';
  approvedBy?: string;
  approvedAt?: string;
  returnedAt?: string;
  notes?: string;
  issueImage?: string;
  returnImage?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface LoginSession {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: 'student' | 'admin';
  loginTime: string;
  logoutTime?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  sessionDuration?: number;
  isActive: boolean;
}

export interface SystemData {
  users: User[];
  components: Component[];
  requests: BorrowRequest[];
  notifications: Notification[];
  loginSessions: LoginSession[];
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalLogins: number;
  onlineUsers: number;
  totalRequests: number;
  pendingRequests: number;
  totalComponents: number;
  overdueItems: number;
}