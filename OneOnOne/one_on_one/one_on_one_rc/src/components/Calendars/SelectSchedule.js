import React, { useState } from "react";
import { BrowserRouter as Router, Route } from 'react-router-dom';
import CalendarTable from "./CalendarTable";
import "components/Calendars/calendar.css";

// Get the date ranges for the weeks between the start and end dates
function calculateWeekRanges(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const adjustedStart = new Date(start);

    // Adjust to the previous Monday
    const dayOfWeek = adjustedStart.getDay();
    const adjustment = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If it's Sunday (0), go back 6 days to last Monday, otherwise go back to the previous Monday
    adjustedStart.setDate(start.getDate() + adjustment);

    const adjustedEnd = new Date(end);
    // Ensure the end date is a Sunday (to complete the week range)
    adjustedEnd.setDate(end.getDate() + (6 - adjustedEnd.getDay()));

    let currentDate = new Date(adjustedStart);
    const weekRanges = [];

    while (currentDate <= adjustedEnd) {
        // Calculate the end of the current week
        const endOfWeek = new Date(currentDate);
        endOfWeek.setDate(currentDate.getDate() + 6);

        weekRanges.push([new Date(currentDate), new Date(endOfWeek)]);

        // Move to the next week
        currentDate.setDate(currentDate.getDate() + 7);
    }

    return weekRanges;
}




function SelectSchedule() {
    const formatDate = ([startDate, endDate]) => {
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    };

    const meetingName = "Meeting Name"; // Change this to the actual meeting name
    const actualStartDate = '2024-04-03T00:00:00'; // Change this to the actual start date
    const actualEndDate = '2024-04-25T00:00:00'; // Change this to the actual end date
    const dateRanges = calculateWeekRanges(actualStartDate, actualEndDate);

    // Initialize the selected date index to the first date range
    const [selectedDateIndex, setSelectedDateIndex] = useState(0);
    const handleDateRangeChange = (event) => {
        setSelectedDateIndex(event.target.value);
    };
    const selectedDate = dateRanges[selectedDateIndex];

    // Initialize the selected preference to high
    const [selectedPreference, setSelectedPreference] = useState("high");
    const handlePreferenceChange = (event) => {
        setSelectedPreference(event.target.value);
    }

    return (
        <section className="jumbotron calendar-table-list">
            <h1 className="display-4 text-center">{meetingName}</h1>

            <div className="calendar-form-drop-down">
                <label htmlFor="dateRanges">Select date:</label>
                <select id="date" name="date" value={selectedDateIndex} onChange={handleDateRangeChange}>
                    {dateRanges.map((range, index) => (
                        <option key={index} value={index}>{formatDate(range)}
                    </option>
                    ))}
                </select>
            </div>

            <div className="calendar-form-drop-down">
                <label htmlFor="preference">Select preference level:</label>
                <select id="preference" name="preference" value={selectedPreference} onChange={handlePreferenceChange}>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
            </div>

            <CalendarTable weekStartDate={selectedDate[0]} actualStartDate={new Date(actualStartDate)} actualEndDate={new Date(actualEndDate)} preference={selectedPreference}/>

            <a className="btn btn-primary">Confirm</a>
        </section>
    );
}

export default SelectSchedule;
