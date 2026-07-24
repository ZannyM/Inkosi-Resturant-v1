const OPERATING_OPEN_HOUR = 10;
const OPERATING_CLOSE_HOUR = 22;
const OPERATING_HOURS_LABEL = "10:00 AM - 10:00 PM (All week)";

const getCurrentHourInStoreTimezone = (date = new Date()) => {
    const hourString = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Africa/Johannesburg",
        hour: "2-digit",
        hour12: false
    }).format(date);

    return Number(hourString);
};

const isWithinOperatingHours = (date = new Date()) => {
    const currentHour = getCurrentHourInStoreTimezone(date);
    return currentHour >= OPERATING_OPEN_HOUR && currentHour < OPERATING_CLOSE_HOUR;
};

export {
    OPERATING_OPEN_HOUR,
    OPERATING_CLOSE_HOUR,
    OPERATING_HOURS_LABEL,
    isWithinOperatingHours
};
