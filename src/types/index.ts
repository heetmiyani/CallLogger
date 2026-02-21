/* =======================
   AUTH & USERS
======================= */

export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'staff'
}

/* =======================
   CLIENTS
======================= */

export interface Client {
  id: number
  clientCode: string
  clientName: string
  phoneNumber: string
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
  | 'Back office'

export type CallStatus = 'Answered' | 'Not Answered'

export type InterestStatus = 'Interested' | 'Not Interested'

export interface CallLog {
  id: number

  clientId: number
  staffId: number

  callRegarding: CallCategory
  status: CallStatus
  interestStatus: InterestStatus

  reminderDays: number | null
  response: string | null

  dateTime: string
  createdAt?: string

  client: {
    id: number
    clientCode: string
    clientName: string
    phoneNumber: string
  }

  staff: {
    id: number
    name: string
    email: string
    role: string
  }
}

/* =======================
   AUTH CONTEXT
======================= */

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}