import React, { useState } from "react";
import "components/Calendars/calendar.css";

// Helper function that generates dates for a week given a start date
const generateWeekDays = (weekStartDate) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStartDate);
        date.setDate(weekStartDate.getDate() + i);
        dates.push(date);
    }
    return dates;
};

const CalendarTable = ({ weekStartDate, weekEndDate, actualStartDate, actualEndDate, preference }) => {
    const weekDays = generateWeekDays(weekStartDate);
    const [selectedSlots, setSelectedSlots] = useState(new Map());

    // Helper function to determine if a date should be greyed out
    const isDateOutOfRange = (date) => {
        return date < actualStartDate || date > actualEndDate;
    };
    
    // Helper function to format a slot's key
    const formatSlotKey = (date, hour) => `${date.toLocaleDateString()}-${hour}`

    // Helper function to toggle a slot's selection
    const toggleSlotSelection = (slotKey) => {
        setSelectedSlots((prevSelectedSlots) => {
            const newSelectedSlots = new Map(prevSelectedSlots);
            
            if (newSelectedSlots.has(slotKey)) {
                newSelectedSlots.delete(slotKey);
            } else {
                newSelectedSlots.set(slotKey, preference);
            }
            return newSelectedSlots;
        });
    };

    // Helper function to determine slot's class based on preference
    const getSlotClass = (slotKey, isOutsideRange) => {
        if (isOutsideRange) {
            return 'calendar-day-not-available';
        } else if (selectedSlots.get(slotKey) === 'high') {
            return 'calendar-high-preference';
        } else if (selectedSlots.get(slotKey) === 'medium') {
            return 'calendar-medium-preference';
        } else if (selectedSlots.get(slotKey) === 'low') {
            return 'calendar-low-preference';
        }
        return '';
    };

    return (
        <>
            <table className="calendar-table">
                <thead>
                    <tr>
                        <th></th>
                        {weekDays.map((date, index) => (
                            <th key={index}>
                                {date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })}
                            </th>
                        ))}
                    </tr>
                </thead>
            </table>

            <table className="calendar-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Monday</th>
                        <th>Tuesday</th>
                        <th>Wednesday</th>
                        <th>Thursday</th>
                        <th>Friday</th>
                        <th>Saturday</th>
                        <th>Sunday</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 13 }, (_, i) => 9 + i).map((hour, index) => (
                        <tr key={index}>
                            <td>{hour % 24}:00 {hour < 12 || hour === 24 ? 'AM' : 'PM'}</td>
                            {weekDays.map((date, index) => {
                                const slotKey = formatSlotKey(date, hour);
                                const isOutsideRange = isDateOutOfRange(date);
                                return (
                                    <td 
                                        key={index} 
                                        className={getSlotClass(slotKey, isOutsideRange)}
                                        style={{cursor: isOutsideRange ? 'not-allowed' : 'pointer'}} 
                                        onClick={() => !isOutsideRange && toggleSlotSelection(slotKey)}
                                    ></td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};

export default CalendarTable;
