import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { CALENDARS_API_URL } from 'constants';
import { ACCOUNTS_API_URL } from "constants";
import CalendarTable from "./ScheduleTable";
import "components/Calendars/calendar.css";
import { calculateWeekRanges } from "components/Calendars/HelperFunctions";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';


function FinalizeSchedule() {
    // Initialize the useState hooks
    const [selectedDateIndex, setSelectedDateIndex] = useState(0);
    const [meetersAndTimes, setMeetersAndTimes] = useState(new Map());
    const [schedule, setSchedule] = useState([]);
    const [isFinalized, setIsFinalized] = useState(false);
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
    const emailSentRef = useRef(false);
    const [isNonSchedule, setIsNonSchedule] = useState(false);

    const handleCantFinalizedSchedule = () => {
        alert("An email has been sent to all participants. It may take a minute to arrive");
        axios.post(`${CALENDARS_API_URL}/${calendar_id}/email/`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .catch((error) => {
            console.error("Error sending email:", error.response.data);
        });
    }

    const handleSendFinalizedSchedule = () => {
        const payload = schedule
        alert("An email with meeting info has been sent to all participants. It may take a minute to arrive.");
        axios.post(`${CALENDARS_API_URL}/${calendar_id}/email/finalize`, payload, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .catch((error) => {
            console.error("Error sending email:", error.response.data);
        });
    }


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
            setSchedule(scheduleResponse.data);
            setIsFinalized(calendarResponse.data.finalized);
            if (scheduleResponse.data.length === 0) {
                setIsNonSchedule(true);
                setIsLoading(false);
            } else {
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
            }
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

    const handleButtonClick = () => {
        if (isFinalized) {
            navigate('/calendars');
        } else {
            finalizeSchedule();
        }
    };

    const finalizeSchedule = async () => {
        if (schedule.length === 0) {
            alert('No schedule to finalize');
            return;
        } else {
            try {
                await axios.put(`${CALENDARS_API_URL}/${calendar_id}/finalize/`, {}, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                alert('Schedule has been finalized');
                setIsFinalized(true);
            } catch (error) {
                console.error('Error finalizing schedule:', error);
            }
        };
    };

    return (
        <>
            {(isNonSchedule) &&
                <div id="overlay">
                    <div className="loading-indicator">
                        <div className="heading">
                            <h2 className="error">Warning</h2>
                        </div>
                        <button onClick={() => { navigate('/calendars')}} className="btn close-button">
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                        <p>Failed to generate any possible schedule given the availabilities provided!</p>
                        <p>Click the button below to send and email to prompt everyone to provide more availabilities.</p>
                        <button onClick={handleCantFinalizedSchedule} className="btn btn-primary">
                            Send emails
                        </button>
                    </div>
                </div>
            }

            <section className="jumbotron calendar-table-list">
                <h1 className="display-4 text-center">{meetingName}</h1>
                <button onClick={handleSendFinalizedSchedule} className="btn btn-success"> Send email to notify invitees</button>   
                <div className="calendar-form-drop-down">
                    <label htmlFor="dateRanges">Select date:</label>
                    <select id="date" name="date" value={selectedDateIndex} onChange={handleDateRangeChange}>
                        {dateRanges.map((range, index) => (
                            <option key={index} value={index}>{formatDate(range)}
                            </option>
                        ))}
                    </select>
                </div>

                <CalendarTable weekStartDate={selectedDate[0]} actualStartDate={new Date(actualStartDate)} actualEndDate={new Date(actualEndDate)} meetersAndTimes={meetersAndTimes} />

                <button onClick={handleButtonClick} className="btn btn-primary">
                    {isFinalized ? 'Return' : 'Finalize'}
                </button>
            </section>
        </>
    );
}

export default FinalizeSchedule;

