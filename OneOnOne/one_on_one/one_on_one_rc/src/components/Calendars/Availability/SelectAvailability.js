import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { CALENDARS_API_URL } from 'constants';
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

// Helper function to convert Availability data to a Map
function convertAvailabilityDataToMap(availabilityData) {
    let availabilityMap = new Map();

    availabilityData.forEach((availability) => {
        const startTime = new Date(availability.start_period);
        const preference = availability.preference;

        availabilityMap.set(startTime.toISOString(), preference.toString());
    });

    return availabilityMap;
}

function SelectAvailability() {
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

    useEffect(() => {
        setIsLoading(true);

        Promise.all([
            axios.get(`${CALENDARS_API_URL}/${calendar_id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }),
            axios.get(`${CALENDARS_API_URL}/${calendar_id}/availabilities`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
        ]).then(([calendarResponse, availabilityResponse]) => {
            setCalendarDetails(calendarResponse.data);
            setIsLoading(false); // Data from both requests is loaded

            if (availabilityResponse.data) {
                const initialSelectedSlots = convertAvailabilityDataToMap(availabilityResponse.data);
                setSelectedSlots(initialSelectedSlots);
            }
        }).catch((error) => {
            setIsLoading(false);
            if (error.response && error.response.status === 401) {
                navigate('/unauthorized');
            }
        });
    }, []);

    const handleSubmit = () => {
        // Check if selecteSlots is empty
        if (selectedSlots.size === 0) {
            alert("Please select at least one availability");
            return;
        } else {
            // Remove all the current availabilities for this calendar of the user
            axios.delete(`${CALENDARS_API_URL}/${calendar_id}/availabilities/bulk-delete`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
                .then((response) => {
                    console.log(response);
                    for (let [availability, preference] of selectedSlots) {
                        const startDate = new Date(availability);
                        const endDate = new Date(startDate);
                        endDate.setMinutes(endDate.getMinutes() + 59);
        
                        var payload = {
                            start_period: startDate,
                            end_period: endDate,
                            preference: parseInt(preference),
                        };

                        console.log(payload)
        
                        axios.post(`${CALENDARS_API_URL}/${calendar_id}/availabilities/`, payload, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                        })
                            .then((response) => {
                                console.log(response);
                            })
                            .catch((error) => {
                                if (error.response && error.response.status === 401) {
                                    navigate('/unauthorized');
                                }
                            });
                    }
                    navigate('/calendars/owned');
                })
                .catch((error) => {
                    if (error.response && error.response.status === 401) {
                        navigate('/unauthorized');
                    }
                });
        }
    };

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

            <button className="btn btn-primary" onClick={handleSubmit}>Confirm</button>
        </section>
    );
}

export default SelectAvailability;
