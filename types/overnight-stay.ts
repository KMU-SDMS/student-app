export interface OvernightStay {
  id: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface OvernightStayFormData {
  startDate: Date;
  endDate: Date;
  reason: string;
}
