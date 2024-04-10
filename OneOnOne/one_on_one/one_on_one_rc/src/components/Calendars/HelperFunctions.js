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

export { calculateWeekRanges, convertAvailabilityDataToMap, generateWeekDays };