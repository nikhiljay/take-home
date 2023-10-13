export interface ProfileData {
  id: string;
  fullName: string;
}

export interface ShiftPreferenceData {
  id: number;
  profileId: string;
  date: string;
}

export interface ScheduleRowData {
  fullName: string;
  fairness?: number;
  shifts: string[];
}
