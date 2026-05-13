export interface Member {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number; // 单位：分，避免浮点数精度问题
  payerId: string;
  involvedMemberIds: string[];
  createdAt: string;
}

export interface Trip {
  id: string;
  name: string;
  members: Member[];
  expenses: Expense[];
  createdAt: string;
}

export interface Balance {
  memberId: string;
  memberName: string;
  totalPaid: number;
  totalOwed: number;
  balance: number; // 正数=应收，负数=应付
}

export interface Transfer {
  from: string; // memberId
  to: string; // memberId
  fromName: string;
  toName: string;
  amount: number;
}
