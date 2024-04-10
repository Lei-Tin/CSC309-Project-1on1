import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { CALENDARS_API_URL } from 'constants';
import AvailabilityTable from "./AvailabilityTable";
import "components/Calendars/calendar.css";
import { calculateWeekRanges, convertAvailabilityDataToMap } from "components/Calendars/HelperFunctions";

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
    }, [calendar_id, navigate]);

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
                    for (let [availability, preference] of selectedSlots) {
                        const startDate = new Date(availability);
                        const endDate = new Date(startDate);
                        endDate.setMinutes(endDate.getMinutes() + 59);
        
                        var payload = {
                            start_period: startDate,
                            end_period: endDate,
                            preference: parseInt(preference),
                        };
        
                        axios.post(`${CALENDARS_API_URL}/${calendar_id}/availabilities/`, payload, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                        })
                            .then((response) => {
                                navigate('/calendars');
                            })
                            .catch((error) => {
                                if (error.response && error.response.status === 401) {
                                    navigate('/unauthorized');
                                }
                            });
                    }
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

            <AvailabilityTable selectedSlots={selectedSlots} setSelectedSlots={setSelectedSlots} weekStartDate={selectedDate[0]} actualStartDate={new Date(actualStartDate)} actualEndDate={new Date(actualEndDate)} preference={selectedPreference} />

            <button className="btn btn-primary" onClick={handleSubmit}>Confirm</button>
        </section>
    );
}

export default SelectAvailability;
