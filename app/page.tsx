import { getDatesBetween, constructScheduleRows } from "./actions";
import dayjs from "dayjs";
import Schedule from "./schedule";
import { getProfiles, getShiftPreferences } from "@/utils/fetchData";

export default async function Home() {
  const periodStartDate = dayjs("2023-09-17");
  const periodEndDate = dayjs("2023-10-07");
  const dates = getDatesBetween(periodStartDate, periodEndDate);

  const profiles = await getProfiles();
  const shiftPreferences = await getShiftPreferences();
  const initialScheduleData = await constructScheduleRows(
    profiles,
    shiftPreferences,
    periodStartDate,
    periodEndDate
  );

  return (
    <main className="pt-16 px-12">
      <h1 className="font-medium text-xl mb-5">Schedule</h1>
      <div>
        <div className="flex">
          <h2 className="w-56 whitespace-nowrap flex-shrink-0 border-r border-b py-2"></h2>
          <div className="flex border-t">
            {dates.map((date) => (
              <div
                key={date.format("M/D")}
                className="flex justify-center items-center w-14 h-14 border-r border-b py-2 text-center"
              >
                <div>
                  <p className="text-sm">{date.format("M/D")}</p>
                  <p className="text-sm">{date.format("ddd")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Schedule initialScheduleData={initialScheduleData} />
      </div>
    </main>
  );
}
