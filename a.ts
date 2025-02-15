import { RRule } from "rrule";
import { DateTime } from "luxon";

const dateEvent = {
    "type": "VEVENT",
    "params": [],
    "uid": "8f36Cjt6mR-5253-6875-3@pttx.unsw.edu.au",
    "dtstamp": "2025-02-15T22:33:23.000Z",
    "summary": "DESN1000 Workshop",
    "description": "DESN1000 Engineering Design Workshop A",
    "comment": "Class 6875 meeting 3",
    "start": "2025-02-20T03:00:00.000Z",
    "datetype": "date-time",
    "end": "2025-02-20T06:00:00.000Z",
    "rrule": {
        "_cache": {
            "all": false,
            "before": [],
            "after": [],
            "between": []
        },
        "origOptions": {
            "tzid": "Australia/Sydney",
            "dtstart": "2025-02-20T14:00:00.000Z",
            "freq": 2,
            "until": "2025-03-23T12:59:00.000Z",
            "byweekday": [
                {
                    "weekday": 3
                }
            ]
        },
        "options": {
            "freq": 2,
            "dtstart": "2025-02-20T14:00:00.000Z",
            "interval": 1,
            "wkst": 0,
            "count": null,
            "until": "2025-03-23T12:59:00.000Z",
            "tzid": "Austalia/Syrdney",
            "bysetpos": null,
            "bymonth": null,
            "bymonthday": [],
            "bynmonthday": [],
            "byyearday": null,
            "byweekno": null,
            "byweekday": [
                3
            ],
            "bynweekday": null,
            "byhour": [
                14
            ],
            "byminute": [
                0
            ],
            "bysecond": [
                0
            ],
            "byeaster": null
        }
    },
    "location": "See School for Location",
    "categories": [
        "Classes"
    ],
    "sequence": "0",
    "status": "CONFIRMED",
    "transparency": "OPAQUE",
    "method": "PUBLISH",
    "attendees": []
}
/* {
    "type": "VEVENT",
    "params": [],
    "uid": "8f36Cjt6mR-5253-5371-1@pttx.unsw.edu.au",
    "dtstamp": "2025-02-15T21:53:24.000Z",
    "summary": "MATH1141 Tutorial",
    "description": "MATH1141 Higher Mathematics 1A Tutorial W17B",
    "comment": "Class 5371 meeting 1",
    "start": "2025-02-20T23:00:00.000Z",
    "datetype": "date-time",
    "end": "2025-02-21T00:00:00.000Z",
    "rrule": {
        "_cache": {
            "all": false,
            "before": [],
            "after": [],
            "between": []
        },
        "origOptions": {
            "tzid": "Australia/Sydney",
            "dtstart": "2025-02-21T10:00:00.000Z",
            "freq": 2,
            "until": "2025-03-23T12:59:00.000Z",
            "byweekday": [
                {
                    "weekday": 4
                }
            ]
        },
        "options": {
            "freq": 2,
            "dtstart": "2025-02-21T10:00:00.000Z",
            "interval": 1,
            "wkst": 0,
            "count": null,
            "until": "2025-03-23T12:59:00.000Z",
            "tzid": "Australia/Sydney",
            "bysetpos": null,
            "bymonth": null,
            "bymonthday": [],
            "bynmonthday": [],
            "byyearday": null,
            "byweekno": null,
            "byweekday": [
                4
            ],
            "bynweekday": null,
            "byhour": [
                10
            ],
            "byminute": [
                0
            ],
            "bysecond": [
                0
            ],
            "byeaster": null
        }
    },
    "location": "Electrical Engineering G23",
    "geo": {
        "lat": -33.917842,
        "lon": 151.231483
    },
    "categories": [
        "Classes"
    ],
    "sequence": "0",
    "status": "CONFIRMED",
    "transparency": "OPAQUE",
    "method": "PUBLISH",
    "attendees": []
} */

// Get the original dateEvent times
/* const originalStart = new Date(dateEvent.rrule.origOptions.dtstart);
const originalEnd = new Date(dateEvent.rrule.origOptions.until);

// Calculate duration
const duration = originalEnd.getTime() - originalStart.getTime();

// Get the hour and minute from the original start time
const startHour = originalStart.getHours();
const startMinute = originalStart.getHours();

// Create RRule options with the original start date
const rruleOptions: any = {
  ...dateEvent.rrule.options,
  dtstart: originalStart
};

if (rruleOptions.until) {
  rruleOptions.until = new Date(rruleOptions.until);
} */

const rruleOptions: any = {
	...dateEvent.rrule.options,
	dtstart: new Date(dateEvent.rrule.options.dtstart),
	until: new Date(dateEvent.rrule.options.until),
    tzid: 'UTC',
}

console.log(new RRule(rruleOptions).all().map(it => {
    // https://github.com/jkbrzt/rrule?tab=readme-ov-file#important-use-utc-dates
    // > THE BOTTOM LINE: Returned "UTC" dates are always meant to be interpreted as dates in your local timezone.
    // > This may mean you have to do additional conversion to get the "correct" local time with offset applied.

    // convert from UTC to local timezone
    return DateTime.fromJSDate(it)
        .toUTC()
        .setZone('local', { keepLocalTime: true })
        .toJSDate()
}))
