export default function Loading() {
  const numRows = 8;
  const numCols = 21;

  return (
    <main className="pt-16 px-12">
      <h1 className="font-medium text-xl mb-5">Schedule</h1>
      <div className="flex">
        <h2 className="w-56 whitespace-nowrap flex-shrink-0 border-r border-b py-2"></h2>
        <div className="flex border-t">
          {Array.from({ length: numCols }).map((_, dateIndex) => (
            <div
              key={dateIndex}
              className="flex justify-center items-center w-14 h-14 border-r border-b py-2 text-center"
            ></div>
          ))}
        </div>
      </div>
      {Array.from({ length: numRows }).map((_, index) => (
        <div key={index} className="flex">
          <div className="w-56 flex flex-shrink-0 justify-between items-center border-r border-b border-l"></div>
          <div className="flex">
            {Array.from({ length: numCols }).map((_, shiftIndex) => (
              <div
                key={shiftIndex}
                className="flex justify-center items-center w-14 border-r border-b py-2"
              >
                &nbsp;
              </div>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
