import { ProfileData, ScheduleRowData, ShiftPreferenceData } from "./types";
import dayjs, { Dayjs } from "dayjs";
import duration from "dayjs/plugin/duration";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(duration);
dayjs.extend(isBetween);

const BASE_URL = "https://azifptzzmwpatntupaae.supabase.co/rest/v1";

export const getDatesBetween = (startDate: Dayjs, endDate: Dayjs): Dayjs[] => {
  const dates = [];

  let currentDate = startDate;
  while (currentDate.isBefore(endDate.add(1, "day"))) {
    dates.push(currentDate);
    currentDate = currentDate.add(1, "day");
  }

  return dates;
};

export const parseProfiles = async (): Promise<ProfileData[]> => {
  const res = await fetch(`${BASE_URL}/profile`, {
    method: "GET",
    headers: {
      "apikey": process.env.API_KEY as string,
    },
  });
  const data = await res.json();

  const profiles = data.map((profile: any) => {
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
  const res = await fetch(`${BASE_URL}/shift_preference`, {
    method: "GET",
    headers: {
      "apikey": process.env.API_KEY as string,
    },
  });
  const data = await res.json();

  const shiftPreferences = data.map((shiftPreference: any) => {
    return {
      id: shiftPreference.id,
      profileId: shiftPreference.profile_id,
      date: shiftPreference.date,
    };
  });

  return shiftPreferences;
};

export const getScheduleRows = async (
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
      shifts: shifts,
    };
  });

  return combinedData;
};
