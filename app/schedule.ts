import Papa from "papaparse";
import { ProfileData, ScheduleRowData, ShiftPreferenceData } from "./types";
import dayjs, { Dayjs } from "dayjs";
import duration from "dayjs/plugin/duration";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(duration);
dayjs.extend(isBetween);

const PERIOD_LENGTH = 21;

export const getDatesBetween = (startDate: Dayjs, endDate: Dayjs): Dayjs[] => {
  const dates = [];

  let currentDate = startDate;
  while (currentDate.isBefore(endDate.add(1, "day"))) {
    dates.push(currentDate);
    currentDate = currentDate.add(1, "day");
  }

  return dates;
};

const parseCSV = async (filePath: string): Promise<any> => {
  const response = await fetch(filePath);
  const csvText = await response.text();
  const parsedCSV = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  return parsedCSV.data;
};

export const parseProfiles = async (): Promise<ProfileData[]> => {
  const csvData = await parseCSV("../dummy_data/profiles.csv");

  const profiles = csvData.map((profile: any) => {
    return {
      id: profile.id,
      fullName: profile.full_name,
    };
  });

  return profiles;
};

export const parseShiftPreferences = async (): Promise<
  ShiftPreferenceData[]
> => {
  const csvData = await parseCSV("../dummy_data/shift_preferences.csv");

  const shiftPreferences = csvData.map((shiftPreference: any) => {
    return {
      id: shiftPreference.id,
      startTime: shiftPreference.start_time,
      endTime: shiftPreference.end_time,
      shiftType: shiftPreference.shift_type,
      profileId: shiftPreference.profile_id,
    };
  });

  return shiftPreferences;
};

export const getScheduleRows = async (
  profiles: ProfileData[],
  shiftPreferences: ShiftPreferenceData[],
  startDate: Dayjs,
): Promise<ScheduleRowData[]> => {
  const combinedData = profiles.map((profile) => {
    const relevantShifts = shiftPreferences.filter(
      (sp) => sp.profileId === profile.id
    );

    const shifts: string[] = new Array(PERIOD_LENGTH).fill("");
    for (const shift of relevantShifts) {
      const shiftStartDay = dayjs(shift.startTime);
      const offset = Math.floor(
        dayjs.duration(shiftStartDay.diff(startDate)).asDays()
      );
      shifts[offset] = "X";
    }

    return {
      fullName: profile.fullName,
      shifts: shifts,
    };
  });

  console.log(combinedData);

  return combinedData;
};
