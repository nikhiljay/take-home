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

export function autoBalance(
  initialScheduleData: ScheduleRowData[],
  schedule: ScheduleRowData[]
) {
  let matrix: string[][] = JSON.parse(
    JSON.stringify(schedule.map((profile) => profile.shifts))
  );

  const numProfiles = matrix.length;
  const numDays = matrix[0].length;
  const minShiftsPerDay = 3;
  const maxShiftsPerDay = 5;

  // Calculate initial shift counts for all days
  const shiftCounts = Array(numDays)
    .fill(0)
    .map((_, dayIdx) =>
      matrix.reduce(
        (count, profileShifts) =>
          count + (profileShifts[dayIdx] === "X" ? 1 : 0),
        0
      )
    );

  // Keep re-balancing until no changes are made
  let changesMade = true;
  while (changesMade) {
    changesMade = false;

    // Iterate over each day
    for (let day = 0; day < numDays; day++) {
      let shortage = minShiftsPerDay - shiftCounts[day];

      // Try to balance the shifts for each profile until shortage is met
      for (let profile = 0; profile < numProfiles && shortage > 0; profile++) {
        if (
          matrix[profile][day] !== "X" &&
          shiftCounts[day] < maxShiftsPerDay
        ) {
          for (let sourceDay = 0; sourceDay < numDays; sourceDay++) {
            // Look for a day with an extra shift to reallocate
            if (
              matrix[profile][sourceDay] === "X" &&
              shiftCounts[sourceDay] > minShiftsPerDay
            ) {
              // Swap the shift
              matrix[profile][sourceDay] = "";
              matrix[profile][day] = "X";

              // Adjust counts post-swap
              shiftCounts[day]++;
              shiftCounts[sourceDay]--;
              shortage--;

              changesMade = true;
              break;
            }
          }
        }
      }
    }
  }

  let newSchedule = matrix.map((profileShifts, profileIdx) => {
    return {
      fullName: schedule[profileIdx].fullName,
      shifts: profileShifts,
    };
  });

  return calculateFairness(initialScheduleData, newSchedule);
}
