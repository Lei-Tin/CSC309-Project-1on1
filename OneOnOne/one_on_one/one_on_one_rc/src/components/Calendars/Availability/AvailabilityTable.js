import React from "react";
import { generateWeekDays } from "components/Calendars/HelperFunctions";
import "components/Calendars/calendar.css";

const AvailabilityTable = ({ selectedSlots, setSelectedSlots, weekStartDate, actualStartDate, actualEndDate, preference }) => {
    const weekDays = generateWeekDays(weekStartDate);

    // Helper function to determine if a date should be greyed out
    const isDateOutOfRange = (date) => {
        return date < actualStartDate || date > actualEndDate;
    };

    // Helper function to format a slot's key
    function formatSlotKey(date, hour) {
        date.setHours(hour);
        return date.toISOString();
    }

    // Helper function to toggle a slot's selection
    const toggleSlotSelection = (slotKey) => {
        console.log(slotKey);
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
        } else if (selectedSlots.get(slotKey) === '3') {
            return 'calendar-high-preference';
        } else if (selectedSlots.get(slotKey) === '2') {
            return 'calendar-medium-preference';
        } else if (selectedSlots.get(slotKey) === '1') {
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
                        {weekDays.map((date, index) => (
                            <th key={index} className={isDateOutOfRange(date) ? 'calendar-day-not-available' : '' }>
                                {date.toLocaleDateString("en-US", { weekday: 'long' })}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {Array.from({ length: 13 }, (_, i) => 9 + i).map((hour, index) => (
                        <tr key={index}>
                            <td>{`${hour <= 12 ? hour : hour - 12}:00 ${hour < 12 ? 'AM' : 'PM'}`}</td>
                            {weekDays.map((date, index) => {
                                const slotKey = formatSlotKey(date, hour);
                                const isOutsideRange = isDateOutOfRange(date);
                                return (
                                    <td
                                        key={index}
                                        className={getSlotClass(slotKey, isOutsideRange)}
                                        style={{ cursor: isOutsideRange ? 'not-allowed' : 'pointer' }}
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

export default AvailabilityTable;
