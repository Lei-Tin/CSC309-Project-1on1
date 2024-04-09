import React from "react";
import { generateWeekDays } from "components/Calendars/HelperFunctions";
import "components/Calendars/calendar.css";

const CalendarTable = ({ weekStartDate, actualStartDate, actualEndDate, meetersAndTimes }) => {
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

    // Helper function to determine if a cell should be colored for a meeting
    const isMeetingSlot = (slotKey) => {
        const formatedSlotKey = slotKey.replace(/\.\d{3}/, "");
        if (meetersAndTimes.has(formatedSlotKey)) {
            console.log(slotKey)
            return { isMeeting: true, name: meetersAndTimes.get(formatedSlotKey)};
        } else {
            return { isMeeting: false, name: ''};
        }
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
                                const { isMeeting, name } = isMeetingSlot(slotKey);
                                const isOutsideRange = isDateOutOfRange(date);
                                return (
                                    <td
                                        key={index}
                                        className={`${isOutsideRange ? 'calendar-day-not-available' : ''} ${isMeeting ? 'calendar-high-preference' : ''}`}
                                        style={{ cursor: isOutsideRange ? 'not-allowed' : 'pointer' }}
                                    >
                                        {isMeeting ? name : ''}
                                    </td>
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
