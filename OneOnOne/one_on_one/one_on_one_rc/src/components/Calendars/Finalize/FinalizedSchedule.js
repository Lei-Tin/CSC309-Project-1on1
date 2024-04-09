import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { CALENDARS_API_URL } from 'constants';
import { ACCOUNTS_API_URL } from "constants";
import CalendarTable from "./ScheduleTable";
import "components/Calendars/calendar.css";
import { calculateWeekRanges } from "components/Calendars/HelperFunctions";


function FinalizeSchedule() {
    // Initialize the useState hooks
    const [selectedDateIndex, setSelectedDateIndex] = useState(0);
    const [meetersAndTimes, setMeetersAndTimes] = useState(new Map());
    const [calendarDetails, setCalendarDetails] = useState({
        owner: '',
        name: '',
        start_date: '',
        end_date: '',
        finalized: false,
    });
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { calendar_id } = useParams();

    useEffect(() => {
        setIsLoading(true);

        Promise.all([
            axios.get(`${CALENDARS_API_URL}/${calendar_id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }),
            axios.get(`${CALENDARS_API_URL}/${calendar_id}/schedule/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
        ]).then(async ([calendarResponse, scheduleResponse]) => {
            setCalendarDetails(calendarResponse.data);
            
            // New Map to accumulate meeting times
            const newMeetersAndTimes = new Map();

            // Fetch each meeter's profile in sequence
            for (const { meeter, start_period } of scheduleResponse.data) {
                try {
                    const response = await axios.get(`${ACCOUNTS_API_URL}/profile/id/${meeter}/`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    const meeterName = response.data.user.username;
                    // Set the start time as the key and the user name as the value
                    newMeetersAndTimes.set(start_period, meeterName);
                } catch (error) {
                    console.error("Error fetching meeter profile:", error);
                }
            }

            setMeetersAndTimes(newMeetersAndTimes);
            setIsLoading(false);
        }).catch((error) => {
            setIsLoading(false);
            console.log('Error loading calendar or schedule:', error);
            if (error.response && error.response.status === 401) {
                navigate('/unauthorized');
            }
        });
    }, [calendar_id, navigate]);

    if (isLoading) {
        return;
    }

    // Initialize the needed calendar details
    const meetingName = calendarDetails.name;
    const actualStartDate = `${calendarDetails.start_date}T00:00:00`;
    const actualEndDate = `${calendarDetails.end_date}T23:00:00`; // Set it to 11 clock to avoid comparison issues

    // Calculate the date ranges for the weeks between the start and end dates
    const dateRanges = calculateWeekRanges(actualStartDate, actualEndDate);

    // Initialize the selected date index to the first date range
    const handleDateRangeChange = (event) => {
        setSelectedDateIndex(event.target.value);
    };
    const selectedDate = dateRanges[selectedDateIndex];

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

            <CalendarTable weekStartDate={selectedDate[0]} actualStartDate={actualStartDate} actualEndDate={actualEndDate} meetersAndTimes={meetersAndTimes} />

            <button className="btn btn-primary">Return</button>
        </section>
    );
}

export default FinalizeSchedule;

