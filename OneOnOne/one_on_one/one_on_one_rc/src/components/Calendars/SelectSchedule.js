import React from "react";

import "components/Calendars/calendar.css";

function calculateWeekRanges(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    // Calculate the previous Sunday for the start date
    const adjustedStart = new Date(start);
    adjustedStart.setDate(start.getDate() - start.getDay());
  
    // Calculate the next Saturday for the end date
    const adjustedEnd = new Date(end);
    adjustedEnd.setDate(end.getDate() + (6 - end.getDay()));
  
    // Initialize the current date to the adjusted start date
    let currentDate = new Date(adjustedStart);
    const weekRanges = [];
  
    // Loop until the current date exceeds the adjusted end date
    while (currentDate <= adjustedEnd) {
      // Calculate the end of the current week
      const endOfWeek = new Date(currentDate);
      endOfWeek.setDate(currentDate.getDate() + 6);
  
      // Format and add the current week range to the list
      weekRanges.push(`${formatDate(currentDate)} - ${formatDate(endOfWeek)}`);
  
      // Move to the next week
      currentDate.setDate(currentDate.getDate() + 7);
    }
  
    return weekRanges;
  }
  
  // Helper function to format dates
  function formatDate(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

function SelectSchedule() {
    const meetingName = "Meeting Name"; // Change this to the actual meeting name
    const dateRanges = calculateWeekRanges('2024-04-03', '2024-04-25'); // Change this to the actual date range

    return (
        <section className="jumbotron calendar-table-list">
            <h1 className="display-4 text-center">{meetingName}</h1>

            <div className="calendar-form-drop-down">
                <label htmlFor="date">Select date:</label>
                <select id="date" name="date">
                    {dateRanges.map((range, index) => (
                        <option key={index} value={range}>{range}</option>
                    ))}
                </select>
            </div>

            <div className="calendar-form-drop-down">
                <label htmlFor="preference">Select preference level:</label>
                <select id="preference" name="preference">
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                </select>
            </div>

            <a className="btn btn-primary">Confirm</a>
        </section>
    );
}

export default SelectSchedule;
