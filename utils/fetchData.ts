import "server-only";
import { ProfileData, ShiftPreferenceData } from "@/types";

const BASE_URL = "https://azifptzzmwpatntupaae.supabase.co/rest/v1";

export const getProfiles = async (): Promise<ProfileData[]> => {
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
      fairness: 100,
    };
  });

  return profiles;
};

export const getShiftPreferences = async (): Promise<ShiftPreferenceData[]> => {
  const res = await fetch(`${BASE_URL}/shift_preference`, {
    method: "GET",
    cache: "no-cache",
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
