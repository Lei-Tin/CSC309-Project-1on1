import { Link } from 'react-router-dom';
import 'components/Calendars/calendar.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PopupModal from 'components/Calendars/Create/Create';
import { CALENDARS_API_URL } from 'constants';


const CalendarList = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [calendars, setCalendars] = useState([]);

    const handleModalOpen = () => setModalOpen(true);
    const handleModalClose = () => setModalOpen(false);

    const fetchCalendars = async () => {
        try {
            const response = await axios.get(`${CALENDARS_API_URL}/owned`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const ownedCalendars = response.data;

            const calendarInvitees = await Promise.all(ownedCalendars.map(async (calendar) => {
                const invitees = await axios.get(`${CALENDARS_API_URL}/${calendar.id}/invitee`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                return { ...calendar, invitees: invitees.data };
            }));

            setCalendars(calendarInvitees);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCalendars();
    }, []);

    const handleCreateCalendar = (calendarData) => {
        console.log('Creating calendar:', calendarData);
        console.log(CALENDARS_API_URL)
        axios.post(`${CALENDARS_API_URL}/`, calendarData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
        .then(() => {
            setModalOpen(false); // Close the modal on success
            fetchCalendars(); // Refresh the list of calendars
        })
        .catch(error => console.error('Error creating calendar', error));
    };

//    const handleEdit = (calendar) => {
//        setEditingId(calendar.id);
//        setEditValue(calendar.name); // Pre-populate the input with the current name
//    };
//
//    const handleNameChange = (e) => {
//        setEditValue(e.target.value);
//    };
//
//    const handleKeyPress = (e, calendarId) => {
//        if (e.key === 'Enter') {
//            e.preventDefault(); // Prevent form submission or any default action
//            onUpdate(calendarId, editValue); // Assuming onUpdate is a prop method to update the calendar
//            setEditingId(null); // Exit editing mode
//        }
//    };

    const handleDelete = (calendarId) => {
        if (window.confirm('Are you sure you want to delete this calendar?')) {
            console.log('Delete calendar', calendarId);
            // Make a DELETE request to your endpoint
            axios.delete(`${CALENDARS_API_URL}/${calendarId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })
            .then(() => fetchCalendars()) // Refresh the list of calendars
            .catch(error => console.error('Error deleting calendar', error));
        }
    };

    return (
        <main>
            <div className="jumbotron calendar-list">
                <h1 className="display-4">My Calendars</h1>
                <button onClick={handleModalOpen} className="btn btn-primary btn-lg">Create a new calendar</button>
                <PopupModal isOpen={isModalOpen} onClose={handleModalClose} onSubmit={handleCreateCalendar} />
                <div className="main-content-container">
                    {calendars.map((calendar) => (
                        <div key={calendar.id} className="calendar-brief rounded">
                          <div className="calendar-meeting-details">
                            <h4>{calendar.name}</h4>
                            <h6>Participants</h6>
                            <ul>
                              {calendar.invitees.map((invitee) => (
                                <li key={invitee.id}>{`${invitee.first_name} ${invitee.last_name}`}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="calendar-btn">
                            <button onClick={() => {}} className="btn btn-success">Enter Calendar</button>
                          </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
};

export default CalendarList;
