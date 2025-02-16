export interface ICSSettings {
    calendars: Record < string, Calendar > ;
}

export interface Calendar {
    icsUrl: string;
    icsName: string;

    /**
     * Optional field for storing the owner email of this calendar.
     * Used when checking PARTSTAT=DECLINED for that email.
     */
    ownerEmail?: string;

    calendarType: 'remote' | 'vdir';

    folder: string;
    tags: string;
    linkIgnores: string; // "Online" will not convert to [[Online]]
    placeIgnores: string; // "See School for Location" will not show on title
    linkClassRegex: string; // for regex \w{4}\d{4} : CLAS1000 -> [[CLAS1000]]
    linkClassTagPrefix: string; // finds CLAS1000 with prefix uni/course -> uni/course/CLAS1000
}

export const DEFAULT_CALENDAR_FORMAT = {
    checkbox: true,
    includeEventEndTime: true,
    icsName: true,
    summary: true,
    location: true,
    description: false,
    calendarType: 'remote',
    showAttendees: false,
    showOngoing: false,
    showTransparentEvents: false
};

export const DEFAULT_SETTINGS: ICSSettings = {
    calendars: {
    }
};
