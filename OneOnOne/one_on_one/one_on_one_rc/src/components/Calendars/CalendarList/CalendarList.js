import { useNavigate } from 'react-router-dom';
import 'components/Calendars/calendar.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import CreateModal from 'components/Calendars/CalendarList/CreateModal';
import InviteeListModal from 'components/Calendars/CalendarList/InviteeListModal';

import { CALENDARS_API_URL } from 'constants';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { faGears } from '@fortawesome/free-solid-svg-icons';


const CalendarList = () => {
    const navigate = useNavigate();
    const [isModalOpen, setModalOpen] = useState(false);
    const [isInviteOpen, setInviteOpen] = useState(false);
    const [calendars, setCalendars] = useState([]);
    const [invitedCalendars, setInvitedCalendars] = useState([]);
    const [selectedCalendarId, setSelectedCalendarId] = useState(null);
    const [showSettings, setShowSettings] = useState({});
    const [editCalendarId, setEditCalendarId] = useState(null);
    const [editedName, setEditedName] = useState("");
    const [tabSelected, setTabSelected] = useState('owned');
    const [keyForReRender, setKeyForReRender] = useState(0);



    const handleModalOpen = () => setModalOpen(true);
    const handleModalClose = () => setModalOpen(false);
    const handleInviteClose = () => setInviteOpen(false);

    const toggleSettings = (id) => {
        setShowSettings(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const fetchCalendars = async () => {
        try {
            const response = await axios.get(`${CALENDARS_API_URL}/owned`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const ownedCalendars = response.data;
            setCalendars(ownedCalendars);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchInvitedCalendars = async () => {
        try {
            const response = await axios.get(`${CALENDARS_API_URL}/invited`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const invitedCalendars = response.data;
            setInvitedCalendars(invitedCalendars);
        } catch (error) {
            console.error(error);
        }
    };

    

    useEffect(() => {
        fetchCalendars();
        fetchInvitedCalendars();
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

    const handleInviteButtonClick = (calendarId) => {
        console.log("Invite button clicked for calendar", calendarId);
        setSelectedCalendarId(calendarId);
        setInviteOpen(true);
    };

    const handleEditClick = (calendar, event) => {
        event.stopPropagation(); // Prevent event propagation

        if (editCalendarId === calendar.id) {
            // If currently in edit mode and "Save" is clicked
            if (editedName.trim() !== "") {
                // If name is not empty, update the name
                updateCalendarName(calendar.id, editedName);
            } else {
                // If name is empty, revert to the original name and potentially notify the user
                setEditedName(calendar.name); // Reset editedName to original name
                setKeyForReRender(prevKey => prevKey + 1);
            }
            setEditCalendarId(null);
        } else {
            // If "Edit" is clicked
            setEditCalendarId(calendar.id);
            setEditedName(calendar.name);
        }
    };

    const handleNameChange = (event) => {
        setEditedName(event.target.innerText);
    };

    const updateCalendarName = (id, name) => {
        axios.put(`${CALENDARS_API_URL}/${id}`, { name }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
        .then(() => fetchCalendars()) // Refresh the list of calendars
        .catch(error => console.error('Error updating calendar name', error));
    };  

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

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
    }

    return (
        <main>
            <div className="jumbotron calendar-list">
                <h1 className="display-4">My Calendars</h1>
                <button onClick={handleModalOpen} className="btn btn-primary btn-lg">Create a new calendar</button>
                {/* Create popup modal for create a calendar */}
                <CreateModal isOpen={isModalOpen} onClose={handleModalClose} onSubmit={handleCreateCalendar} />

                <div className="btn-group me-2 tab-container">
                    <button onClick={() => setTabSelected('owned')} className={`btn btn-outline-secondary tab ${tabSelected === 'owned' ? 'active' : ''}`}>Owned</button>
                    <button onClick={() => setTabSelected('invited')} className={`btn btn-outline-secondary tab ${tabSelected === 'invited' ? 'active' : ''}`}>Invited</button>
                </div>

                <div className="main-content-container">
                    {tabSelected === 'owned'
                        ?
                        calendars.map((calendar) => (
                            <div key={calendar.id} className="calendar-brief rounded">
                                <div className="calendar-meeting-details">
                                <h4
                                    contentEditable={editCalendarId === calendar.id}
                                    onInput={handleNameChange}
                                    suppressContentEditableWarning={true}
                                    className={editCalendarId === calendar.id ? 'editable' : ''}
                                    key={keyForReRender}
                                >
                                    {calendar.name}
                                </h4>
                                    <h6>{formatDate(calendar.start_date)} - {formatDate(calendar.end_date)}</h6>
                                    <button className="btn btn-info" onClick={() => handleInviteButtonClick(calendar.id)}>View Participants</button>
                                        {/* Invited users popup */}
                                        {isInviteOpen && selectedCalendarId === calendar.id && (
                                            <InviteeListModal calendarId={selectedCalendarId} isOpen={isInviteOpen} onClose={handleInviteClose} />
                                        )}
                                </div>
                                <div className="calendar-btn">
                                    <button onClick={() => navigate(`/calendars/${calendar.id}/availabilities`)} className="btn btn-success">Enter Calendar</button>
                                </div>
                                <button onClick={() => {toggleSettings(calendar.id)}} className="btn setting-button">
                                    {showSettings[calendar.id] ? <FontAwesomeIcon icon={faGears} /> : <FontAwesomeIcon icon={faCog} />}
                                </button>
                                {showSettings[calendar.id] && (
                                    <div className="setting-panel">
                                        <button 
                                            className="btn btn-primary" 
                                            onClick={(e) => handleEditClick(calendar, e)}>
                                                {editCalendarId === calendar.id ? 'Save' : 'Edit'}
                                        </button>
                                        <button onClick={() => handleDelete(calendar.id)} className="dropdown-item text-danger">Delete</button>
                                    </div>
                                )}
                            </div>
                        ))
                        :
                        invitedCalendars.map((calendar) => (
                            <div key={calendar.id} className="calendar-brief rounded">
                                <div className="calendar-meeting-details">
                                    <h4>{calendar.name}</h4>
                                    <h6>{formatDate(calendar.start_date)} - {formatDate(calendar.end_date)}</h6>
                                </div>
                                <div className="calendar-btn">
                                    <button onClick={() => navigate(`/calendars/${calendar.id}/availabilities`)} className="btn btn-success">Enter Availability</button>
                                </div>
                                <button onClick={() => toggleSettings(calendar.id)} className="btn settings-button">
                                    <FontAwesomeIcon icon={faCog} />
                                </button>
                            </div>
                        ))
                    }
                </div>
            </div>
        </main>
    );
};

export default CalendarList;
