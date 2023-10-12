export interface ProfileData {
  id: string;
  fullName: string;
}

export interface ShiftPreferenceData {
  id: number;
  startTime: string;
  endTime: string;
  profileId: string;
}

export interface ScheduleRowData {
  fullName: string;
  shifts: string[];
}
