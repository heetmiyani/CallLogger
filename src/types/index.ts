/* =======================
   AUTH & USERS
======================= */

export interface User {
  email: string;
  role: 'admin' | 'staff';
  name: string;
}

export interface InternalUser extends User {
  password: string; // admin-managed credentials
}

/* =======================
   CLIENTS
======================= */

export interface Client {
  id: number;
  clientCode: string;
  clientName: string;
  phoneNumber: string;
}

/* =======================
   CALL LOGS
======================= */

export type CallCategory =
  | 'Trading'
  | 'Mutual Funds'
  | 'IPO'
  | 'MTF'
  | 'FNO'
  | 'DP Dues'
  | 'SLBM'
  | 'Back office';

export type CallStatus = 'Answered' | 'Not Answered';

export type InterestStatus = 'Interested' | 'Not Interested';

export interface CallLog {
  id: string;

  clientCode: string;
  clientName: string;
  phoneNumber: string;

  callRegarding: CallCategory;
  status: CallStatus;

  /**
   * Only meaningful when status === 'Answered'
   * Auto-set to 'Not Interested' otherwise
   */
  interestStatus: InterestStatus;

  /**
   * Present only when:
   * status === 'Answered' && interestStatus === 'Interested'
   */
  reminderDays?: number;

  /**
   * ✅ NEW
   * Marks whether reminder has been resolved
   * Auto-set to true when staff re-logs the call
   */
  isReminderResolved?: boolean;

  /**
   * Present only when status === 'Answered'
   */
  response?: string;

  dateTime: string;
  staffName: string; // single source of truth
}

/* =======================
   AUTH CONTEXT
======================= */

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;

  // 🔐 Admin-only user management
  users: InternalUser[];
  addUser: (user: InternalUser) => void;
  updateUserPassword: (email: string, password: string) => void;
  deleteUser: (email: string) => void;
}
