export interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff';
  name: string;
}

export interface Client {
  clientCode: string;
  clientName: string;
  phoneNumber: string;
}

export interface CallLog {
  id: string;
  clientCode: string;
  clientName: string;
  phoneNumber: string;
  callRegarding: 'Mutual Funds' | 'Trading';
  status: 'Answered' | 'Not Answered';
  response?: string;
  dateTime: string;
  staffId: string;
  staffName: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}
