import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import "./heatmap.css";
import { Tooltip } from "react-tooltip";

export default function HabitHeatmap({ logs }) {

  const values = (() => {
    if (!Array.isArray(logs)) return [];

    const map = {};

    logs.forEach(log => {
      const date = new Date(log.date).toISOString().slice(0, 10);

      if (!map[date]) map[date] = 0;

      if (log.status === "approved") {
        map[date] += 1;
      }
    });

    return Object.keys(map).map(date => ({
      date,
      count: map[date]
    }));
  })();

  return (
    <div className="mt-8 flex justify-center">

      <div className="w-full max-w-[750px]">

        <h2 className="text-xl font-bold mb-4">
          Habit Progress
        </h2>

        <CalendarHeatmap
          startDate={new Date(new Date().setMonth(new Date().getMonth()-3))}
          endDate={new Date()}
          values={values}

          classForValue={(value) => {
            if (!value || value.count === 0) return "color-empty";
            if (value.count === 1) return "color-github-1";
            if (value.count === 2) return "color-github-2";
            if (value.count === 3) return "color-github-3";
            return "color-github-4";
          }}

          tooltipDataAttrs={(value) => {
            if (!value || !value.date) return null;

            return {
              "data-tooltip-id": "heatmap-tooltip",
              "data-tooltip-content": `${value.date} - ${value.count} completions`
            };
          }}
        />

        <Tooltip id="heatmap-tooltip" />

      </div>

    </div>
  );
}