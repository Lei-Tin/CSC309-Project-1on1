import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { CALENDARS_API_URL } from 'constants';
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

function GetCalendarDetails() {
    let { calendar_id } = useParams();
    const [calendarDetails, setCalendarDetails] = useState({
        owner: '',
        name: '',
        start_date: '',
        end_date: '',
        finalized: false,
    });
    const navigate = useNavigate();
    
    useEffect(() => {
        axios.get(`${CALENDARS_API_URL}/${calendar_id}/`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then((response) => {
            setCalendarDetails(response.data);
        })
        .catch((error) => {
            if (error.response && error.response.status === 401) {
                navigate('/unauthorized');
            }
        });
    }, [navigate]);

    return { calendarDetails };
}

const FormatAvailabilities = (selectedSlots) =>{
    // Check if selecteSlots is empty
    if (selectedSlots.size === 0) {
        alert("Please select at least one availability");
        return;
    }
}

function SelectSchedule() {
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

    const [selectedSlots, setSelectedSlots] = useState(new Map());

    const formatDate = ([startDate, endDate]) => {
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    };

    const handleConfirmClick = () => {
        FormatAvailabilities(selectedSlots);
    };

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

            <CalendarTable selectedSlots={selectedSlots} setSelectedSlots={setSelectedSlots} weekStartDate={selectedDate[0]} actualStartDate={new Date(actualStartDate)} actualEndDate={new Date(actualEndDate)} preference={selectedPreference}/>

            <a className="btn btn-primary" onClick={handleConfirmClick}>Confirm</a>
        </section>
    );
}

export default SelectSchedule;
