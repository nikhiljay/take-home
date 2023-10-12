import {
  getDatesBetween,
  getScheduleRows,
  parseProfiles,
  parseShiftPreferences,
} from "./schedule";
import dayjs from "dayjs";

export default async function Home() {
  const periodStartDate = dayjs("2023-09-17");
  const periodEndDate = dayjs("2023-10-07");
  const dates = getDatesBetween(periodStartDate, periodEndDate);

  const profiles = await parseProfiles();
  const shiftPreferences = await parseShiftPreferences();

  const schedule = await getScheduleRows(
    profiles,
    shiftPreferences,
    periodStartDate,
    periodEndDate
  );

  return (
    <main className="p-16">
      <div className="flex justify-between items-center mb-2">
        <h1 className="font-medium text-lg">Schedule</h1>
        <button className="px-3 py-1 bg-black text-white rounded-md mb-5">
          Autobalance
        </button>
      </div>
      {schedule.length > 0 && (
        <div>
          <div className="flex">
            <h2 className="w-44 whitespace-nowrap flex-shrink-0 border-r border-b py-2"></h2>
            <div className="flex border-t">
              {dates.map((date) => (
                <div
                  key={date.format("M/D")}
                  className="flex justify-center items-center w-14 border-r border-b py-2"
                >
                  {date.format("M/D")}
                </div>
              ))}
            </div>
          </div>
          {schedule.map((row) => (
            <div key={row.fullName} className="flex">
              <h2 className="w-44 whitespace-nowrap flex-shrink-0 border-r border-b border-l py-2 pl-2">
                {row.fullName}
              </h2>
              <div className="flex">
                {row.shifts.map((shift, index) => (
                  <div
                    key={`${row.fullName}-${index}`}
                    className="flex justify-center items-center w-14 border-r border-b py-2"
                  >
                    {shift}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
