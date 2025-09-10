import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DayPilot, DayPilotCalendar } from "@daypilot/daypilot-lite-react";
import { motion } from "framer-motion";

// Define theme as a separate object using the site's color palette
const calendarTheme = {
  event: {
    borderColor: "#dd6529", // --color-orange-wheel
    borderRadius: "4px",
    fontSize: "14px",
    padding: "4px 8px",
    color: "#262626", // --color-eerie-black
  },
  eventBar: {
    height: "100%",
    left: "2px",
    width: "4px",
    cornerRadius: "2px 0 0 2px",
  },
  header: {
    background: "#f3a850", // --color-ash-gray
    color: "#262626", // --color-eerie-black
  },
  cell: {
    borderRight: "1px solid #ECE2D0", // --color-bone
    borderBottom: "1px solid #ECE2D0", // --color-bone
  },
};

const Calendar = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState("2025-08-31");
  const [events] = useState([
    {
      id: 1,
      text: "Design Society Meeting",
      start: "2025-09-05T18:00:00",
      end: "2025-09-05T20:00:00",
      backColor: "#e8a087",
      location: "SCI 1.201",
    },
    {
      id: 2,
      text: "Workshop: UI/UX Design",
      start: "2025-09-12T17:00:00",
      end: "2025-09-12T19:00:00",
      backColor: "#a5d8ff",
      location: "SCI 2.101",
    },
    {
      id: 3,
      text: "Guest Speaker Series",
      start: "2025-09-19T18:30:00",
      end: "2025-09-19T20:30:00",
      backColor: "#b2f2bb",
      location: "SCI 1.301",
    },
  ]);

  const calendarRef = useRef();

  const [config, setConfig] = useState({
    viewType: "Week",
    durationBarVisible: false,
    timeRangeSelectedHandling: "Disabled",
    eventMoveHandling: "Disabled",
    eventResizeHandling: "Disabled",
    eventDeleteHandling: "Disabled",
    eventClickHandling: "Enabled",
    onEventClick: (args) => {
      navigate(`/event/${args.e.id()}`);
    },
    eventHeight: 30,
    headerHeight: 40,
    hourWidth: 50,
    onBeforeEventRender: (args) => {
      args.data.barColor = args.data.backColor;
      args.data.areas = [
        {
          bottom: 5,
          left: 0,
          right: 0,
          height: 20,
          html: `<div style="padding: 0 5px; font-size: 11px; text-align: center; color: #666;">${args.data.location}</div>`,
        },
      ];
    },
  });

  // Handle theme and dark mode changes
  useEffect(() => {
    const applyTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      if (isDark) {
        setConfig((prevConfig) => ({ ...prevConfig, theme: "dark" }));
      } else {
        setConfig((prevConfig) => ({ ...prevConfig, ...calendarTheme }));
      }
    };

    applyTheme();

    const observer = new MutationObserver(applyTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Navigation helpers
  const goPrev = () => {
    if (date) {
      const prevDate = new Date(date);
      prevDate.setDate(prevDate.getDate() - 7);
      setDate(prevDate.toISOString().split("T")[0]);
    }
  };
  
  const goNext = () => {
    if (date) {
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 7);
      setDate(nextDate.toISOString().split("T")[0]);
    }
  };
  
  const goToday = () => {
    const today = new Date();
    setDate(today.toISOString().split("T")[0]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white dark:bg-neutral-900 rounded-xl p-3 shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 transition"
          >
            ◀ Prev
          </button>
          <button
            onClick={goToday}
            className="px-3 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            Today
          </button>
          <button
            onClick={goNext}
            className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 transition"
          >
            Next ▶
          </button>
        </div>

        {/* Date Picker */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-1 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-400 transition"
        />
      </div>

      {/* Calendar */}
      <div className="h-[600px]">
        <DayPilotCalendar 
          {...config} 
          events={events} 
          startDate={date}   // ✅ correct prop
          ref={calendarRef} 
        />
      </div>
    </motion.div>
  );
};

export default Calendar;
