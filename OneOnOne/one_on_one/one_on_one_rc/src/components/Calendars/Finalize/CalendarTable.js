import React from "react";
import { generateWeekDays } from "components/Calendars/HelperFunctions";
import "components/Calendars/calendar.css";

const CalendarTable = ({ weekStartDate, actualStartDate, actualEndDate }) => {
    const weekDays = generateWeekDays(weekStartDate);

    // Helper function to determine if a date should be greyed out
    const isDateOutOfRange = (date) => {
        return date < actualStartDate || date > actualEndDate;
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
                                const isOutsideRange = isDateOutOfRange(date);
                                console.log(date, isOutsideRange);
                                return (
                                    <td
                                        key={index}
                                        className={isOutsideRange ? 'calendar-day-not-available' : '' }
                                        style={{ cursor: isOutsideRange ? 'not-allowed' : 'pointer' }}
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
