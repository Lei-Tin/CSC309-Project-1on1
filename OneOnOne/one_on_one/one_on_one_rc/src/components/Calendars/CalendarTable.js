import React, { useState } from "react";

// Helper function that generates dates for a week given a start date
const generateWeekDays = (startDate) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date);
    }
    return dates;
};

const CalendarTable = ({ startDate, endDate }) => {
    const weekDays = generateWeekDays(startDate);
    const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
        

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
                            <td>{hour}:00 PM</td>
                            {Array.from({ length: 7 }, (_, index) => (
                                <td key={index}></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};

export default CalendarTable;
