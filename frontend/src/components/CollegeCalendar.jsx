import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContent } from "../context/AppContext";

// 🇮🇳 Month-wise Indian Government Holidays
const indianHolidays = {
  0: { 1: "New Year", 26: "Republic Day" }, // Jan
  7: { 15: "Independence Day" },
  11: { 2: "Gandhi Jayanti", 25: "Christmas" },
  3: { 2: "Good Friday", 4: "Easter Sunday" },
  5: { 6: "Bakrid" },
  6: { 15: "Independence Day", 27: "Ganesh Chaturthi" },
  8: { 5: "Milad-un-Nabi", 1: "Saraswathi Pooja" },
  9: { 20: "Diwali", 1: "Puducherry Liberation Day" },
  0: { 13: "Lohri", 14: "Makar Sankranti", 26: "Republic Day" },
  1: { 27: "Maha Shivaratri" },
  2: { 2: "Holi" },
};

const CollegeCalendar = () => {
  const { backendUrl } = useContext(AppContent);
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [events, setEvents] = useState([]);

  const [selectedDate, setSelectedDate] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const [newEvent, setNewEvent] = useState("");

  //  Fetch events
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const res = await axios.get(`${backendUrl}/api/college/get-events`);
    setEvents(res.data.AllEvents || []);
  };

  //  Add event
  const addEvent = async () => {
    if (!newEvent || !selectedDate) return;

    await axios.post(`${backendUrl}/api/college/add-events`, {
      date: selectedDate,
      events: newEvent,
    });
    setShowPopup(false);
    setNewEvent("");
    fetchEvents();
  };

  //  Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const currentMonthHolidays = indianHolidays[currentMonth] || {};

  const monthlyEvents = events.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  //  Month switch
  const changeMonth = (dir) => {
    if (dir === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((y) => y - 1);
      } else setCurrentMonth((m) => m - 1);
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((y) => y + 1);
      } else setCurrentMonth((m) => m + 1);
    }
  };

  // Click day
  const openDay = (day) => {
    const d = new Date(currentYear, currentMonth, day);
    setSelectedDate(d);
    setShowPopup(true);
  };

  const selectedDayEvents = selectedDate
    ? events.filter(
        (e) => new Date(e.date).toDateString() === selectedDate.toDateString()
      )
    : [];

  return (
    <div className="flex gap-4 p-4">
      {/* LEFT CALENDAR */}
      <div className="w-3/4 bg-gray-100 p-4 rounded-lg">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => changeMonth("prev")}
            className="px-3 py-1 bg-gray-300 rounded"
          >
            ◀
          </button>

          <h2 className="text-xl font-bold">
            {new Date(currentYear, currentMonth).toLocaleString("default", {
              month: "long",
            })}{" "}
            {currentYear}
          </h2>

          <button
            onClick={() => changeMonth("next")}
            className="px-3 py-1 bg-gray-300 rounded"
          >
            ▶
          </button>
        </div>

        {/* DAYS */}
        <div className="grid grid-cols-7 text-center font-semibold mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* CALENDAR GRID */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, i) => {
            if (!day) return <div key={i} />;

            const dateObj = new Date(currentYear, currentMonth, day);
            const isSunday = dateObj.getDay() === 0;
            const isHoliday = currentMonthHolidays[day];
            const isToday =
              day === today.getDate() &&
              currentMonth === today.getMonth() &&
              currentYear === today.getFullYear();

            return (
              <div
                key={i}
                onClick={() => openDay(day)}
                className={`cursor-pointer h-20 border rounded flex flex-col items-center justify-center
                ${isSunday || isHoliday ? "bg-red-500 text-white" : "bg-white"}
                ${isToday ? "ring-4 ring-blue-400" : ""}
                `}
              >
                <div className="font-bold">{day}</div>
                {isHoliday && (
                  <div className="text-xs text-center">{isHoliday}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-1/4 space-y-4">
        {/* MONTHLY EVENTS */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">Monthly Events</h3>
          {monthlyEvents.length === 0 && (
            <p className="text-sm text-gray-500">No events</p>
          )}
          {monthlyEvents.map((e, i) => (
            <p key={i} className="text-sm">
              {new Date(e.date).getDate()} : {e.events}
            </p>
          ))}
        </div>

        {/* HOLIDAYS */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">Government Holidays</h3>
          {Object.entries(currentMonthHolidays).map(([d, n]) => (
            <p key={d} className="text-sm text-red-600">
              {d} : {n}
            </p>
          ))}
        </div>
      </div>

      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white w-96 p-4 rounded shadow-lg">
            <h3 className="font-bold mb-2">{selectedDate.toDateString()}</h3>

            {selectedDayEvents.length === 0 && (
              <p className="text-sm text-gray-500">No events</p>
            )}

            {selectedDayEvents.map((e, i) => (
              <p key={i} className="text-sm">
                • {e.events}
              </p>
            ))}

            <input
              type="text"
              placeholder="Add event"
              value={newEvent}
              onChange={(e) => setNewEvent(e.target.value)}
              className="border p-2 rounded w-full mt-3"
            />

            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setShowPopup(false)}
                className="px-3 py-1 bg-gray-300 rounded cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={addEvent}
                className="px-3 py-1 bg-blue-600 text-white rounded cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollegeCalendar;
