import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { CALENDARS_API_URL, ACCOUNTS_API_URL } from 'constants';
import CalendarTable from "./CalendarTable";
import "components/Calendars/calendar.css";

// Helper function to get the date ranges for the weeks between the start and end dates
function calculateWeekRanges(startDate, endDate) {
    let start = new Date(startDate);
    let end = new Date(endDate);

    // Adjust the start date to the previous Monday, unless it's already a Monday
    if (start.getDay() !== 1) {
        start.setDate(start.getDate() - (start.getDay() ? start.getDay() - 1 : 6));
    }

    // Adjust the end date to the following Sunday, unless it's already a Sunday
    if (end.getDay() !== 0) {
        end.setDate(end.getDate() + (7 - end.getDay()));
    }

    // Initialize the array to hold all week ranges
    let weekRanges = [];

    while (start <= end) {
        // Calculate the end of the week from the current start date
        let endOfWeek = new Date(start);
        endOfWeek.setDate(start.getDate() + 6);

        if (endOfWeek > end) {
            endOfWeek = end; // Ensure the end of the last week does not exceed the end date
        }

        // Add the week range to the array as Date objects
        weekRanges.push([new Date(start), new Date(endOfWeek)]);

        // Move to the next week
        start.setDate(start.getDate() + 7);
    }

    return weekRanges;
}

// Helper function to convert a date-time string to a Date object
function convertToDateTime(dateTimeStr) {
    // Assuming the format is "YYYY-MM-DD-HH"
    const parts = dateTimeStr.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const hour = parseInt(parts[3], 10);

    // Create a Date object
    const date = new Date(year, month, day, hour);

    return date;
}

function SelectSchedule() {
    // Initialize the useState hooks
    const [selectedPreference, setSelectedPreference] = useState("3");
    const [selectedDateIndex, setSelectedDateIndex] = useState(0);
    const [selectedSlots, setSelectedSlots] = useState(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    let { calendar_id } = useParams();
    const [calendarDetails, setCalendarDetails] = useState({
        owner: '',
        name: '',
        start_date: '',
        end_date: '',
        finalized: false,
    });

    const [selectedProfile, setSelectedProfile] = useState({
        user: { id: '', username: '', first_name: '', last_name: '', email: '' },
        profile_picture: '',
    });

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            axios.get(`${CALENDARS_API_URL}/${calendar_id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }),
            axios.get(`${ACCOUNTS_API_URL}/profile`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
        ]).then(([calendarResponse, profileResponse]) => {
            setCalendarDetails(calendarResponse.data);
            setSelectedProfile(profileResponse.data);
            setIsLoading(false); // Data from both requests is loaded
        }).catch((error) => {
            setIsLoading(false);
            // Handle error more specifically if needed
            if (error.response && error.response.status === 401) {
                navigate('/unauthorized');
            }
        });
    }, [calendar_id, navigate]);

    const handleSubmit = () => {
        // Check if selecteSlots is empty
        if (selectedSlots.size === 0) {
            alert("Please select at least one availability");
            return;
        } else {
            for (let [availability, preference] of selectedSlots) {
                const startDate = convertToDateTime(availability);
                const endDate = new Date(startDate);
                endDate.setMinutes(endDate.getMinutes() + 59);

                var payload = {
                    calendar: calendar_id,
                    user: user_id,
                    start_date: startDate,
                    end_date: endDate,
                    preference: parseInt(preference),
                };

                axios.put(`${CALENDARS_API_URL}/${calendar_id}/availabilities/`, payload, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                })
            }
            navigate('/calendars/owned');
        }
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }

    // Initialize the needed calendar details
    const meetingName = calendarDetails.name;
    const actualStartDate = `${calendarDetails.start_date}T00:00:00`;
    const actualEndDate = `${calendarDetails.end_date}T00:00:00`;

    // Get the user id from the selected profile
    const user_id = selectedProfile.user.id;

    // Calculate the date ranges for the weeks between the start and end dates
    const dateRanges = calculateWeekRanges(actualStartDate, actualEndDate);

    // Initialize the selected date index to the first date range
    const handleDateRangeChange = (event) => {
        setSelectedDateIndex(event.target.value);
    };
    const selectedDate = dateRanges[selectedDateIndex];

    // Initialize the selected preference to high
    const handlePreferenceChange = (event) => {
        setSelectedPreference(event.target.value);
    }

    const formatDate = ([startDate, endDate]) => {
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
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
                    <option value="3">High</option>
                    <option value="2">Medium</option>
                    <option value="1">Low</option>
                </select>
            </div>

            <CalendarTable selectedSlots={selectedSlots} setSelectedSlots={setSelectedSlots} weekStartDate={selectedDate[0]} actualStartDate={new Date(actualStartDate)} actualEndDate={new Date(actualEndDate)} preference={selectedPreference} />

            <a className="btn btn-primary" onClick={handleSubmit}>Confirm</a>
        </section>
    );
}

export default SelectSchedule;
