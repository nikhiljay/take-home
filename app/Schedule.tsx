"use client";

import { ScheduleRowData } from "@/types";
import { useState } from "react";
import { calculateAverageFairness, randomAutoBalance } from "./actions";

export default function Schedule({
  initialScheduleData,
}: {
  initialScheduleData: ScheduleRowData[];
}) {
  const [schedule, setSchedule] = useState(initialScheduleData);
  const avgFairness = calculateAverageFairness(schedule);

  const autoBalance = async (
    initialScheduleData: ScheduleRowData[],
    currentSchedule: ScheduleRowData[]
  ): Promise<ScheduleRowData[]> => {
    const newSchedule = randomAutoBalance(initialScheduleData, currentSchedule);
    const newAvgFairness = calculateAverageFairness(newSchedule);

    setSchedule(newSchedule);

    if (newAvgFairness < 50) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return autoBalance(initialScheduleData, newSchedule);
    } else {
      return newSchedule;
    }
  };

  return (
    <>
      {schedule.map((row: ScheduleRowData) => (
        <div key={row.fullName} className="flex">
          <div className="w-56 flex flex-shrink-0 justify-between items-center border-r border-b border-l">
            <p className="whitespace-nowrap flex-shrink-0 py-2 pl-2">
              {row.fullName}
            </p>
            <p className="text-sm mr-2 bg-gray-500 text-white rounded-md px-2 py-1">
              {`${row.fairness}%`}
            </p>
          </div>
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
      <div className="flex justify-center mt-14">
        <div className="text-center">
          <p className="mb-3">Average Fairness: {`${avgFairness}%`}</p>
          <button
            className="px-4 py-2 bg-black hover:bg-gray-700 text-white rounded-md mb-5"
            onClick={() => autoBalance(initialScheduleData, schedule)}
          >
            Auto-Balance
          </button>
        </div>
      </div>
    </>
  );
}
