import { ProfileData, ScheduleRowData, ShiftPreferenceData } from "../types";
import dayjs, { Dayjs } from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export const getDatesBetween = (startDate: Dayjs, endDate: Dayjs): Dayjs[] => {
  const dates = [];

  let currentDate = startDate;
  while (currentDate.isBefore(endDate.add(1, "day"))) {
    dates.push(currentDate);
    currentDate = currentDate.add(1, "day");
  }

  return dates;
};

export const constructScheduleRows = async (
  profiles: ProfileData[],
  shiftPreferences: ShiftPreferenceData[],
  startDate: Dayjs,
  endDate: Dayjs
): Promise<ScheduleRowData[]> => {
  const combinedData = profiles.map((profile) => {
    const relevantShifts = shiftPreferences.filter(
      (sp) => sp.profileId === profile.id
    );

    const periodLength = dayjs(endDate).diff(startDate, "day") + 1;
    const shifts: string[] = new Array(periodLength).fill("");
    for (const shift of relevantShifts) {
      const shiftStartDay = dayjs(shift.date);
      const offset = Math.floor(
        dayjs.duration(shiftStartDay.diff(startDate)).asDays()
      );
      shifts[offset] = "X";
    }

    return {
      fullName: profile.fullName,
      fairness: 100,
      shifts: shifts,
    };
  });

  return combinedData;
};

const calculateFairness = (
  oldSchedule: ScheduleRowData[],
  newSchedule: ScheduleRowData[]
): ScheduleRowData[] => {
  newSchedule.forEach((profile, profileIndex) => {
    const oldShifts = oldSchedule[profileIndex].shifts;
    const newShifts = profile.shifts;

    const numOldShifts = oldShifts.reduce(
      (count, shift) => count + (shift === "X" ? 1 : 0),
      0
    );

    let honoredShifts = 0;
    oldShifts.forEach((shift, shiftIndex) => {
      if (shift === "X" && shift === newShifts[shiftIndex]) {
        honoredShifts++;
      }
    });

    profile.fairness = Math.round((honoredShifts / numOldShifts) * 100);
  });

  return newSchedule;
};

export const calculateAverageFairness = (
  schedule: ScheduleRowData[]
): number => {
  const totalFairness = schedule.reduce(
    (sum, profile) => sum + (profile.fairness || 0),
    0
  );
  return Math.round(totalFairness / schedule.length);
};

export const randomAutoBalance = (
  initialScheduleData: ScheduleRowData[],
  schedule: ScheduleRowData[]
) => {
  const shifts = schedule.map((row) => row.shifts);

  const shiftsFlattened = shifts.reduce((acc, val) => acc.concat(val), []);
  let shiftsShuffled = shiftsFlattened
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  const shiftsReshaped = [];
  const rows = shifts.length;
  const cols = shifts[0].length;
  for (let i = 0; i < rows; i++) {
    shiftsReshaped[i] = shiftsShuffled.slice(i * cols, (i + 1) * cols);
  }

  const scheduleRows = shiftsReshaped.map((shift, index) => {
    return {
      fullName: schedule[index].fullName,
      shifts: shift,
    };
  });

  const newSchedule = calculateFairness(initialScheduleData, scheduleRows);
  return newSchedule;
};
