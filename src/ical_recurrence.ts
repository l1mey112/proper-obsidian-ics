import { DateTime } from "luxon";
import { RRule } from "rrule";

/* {
    "type": "VEVENT",
    "params": [],
    "uid": "8f36Cjt6mR-5253-5085-2@pttx.unsw.edu.au",
    "dtstamp": "2025-02-15T20:41:03.000Z",
    "summary": "MATH1081 Lecture",
    "description": "MATH1081 Discrete Mathematics Lecture B",
    "comment": "Class 5085 meeting 2",
    "start": "2025-04-04T01:00:00.000Z",
    "datetype": "date-time",
    "end": "2025-04-04T02:00:00.000Z",
    "rrule": {
        "_cache": {
            "all": false,
            "before": [],
            "after": [],
            "between": []
        },
        "origOptions": {
            "tzid": "Australia/Sydney",
            "dtstart": "2025-04-04T12:00:00.000Z",
            "freq": 2,
            "until": "2025-04-13T13:59:00.000Z",
            "byweekday": [
                {
                    "weekday": 4
                }
            ]
        },
        "options": {
            "freq": 2,
            "dtstart": "2025-04-04T12:00:00.000Z",
            "interval": 1,
            "wkst": 0,
            "count": null,
            "until": "2025-04-13T13:59:00.000Z",
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
                12
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
    "location": "Online",
    "categories": [
        "Classes"
    ],
    "sequence": "0",
    "status": "CONFIRMED",
    "transparency": "OPAQUE",
    "method": "PUBLISH",
    "attendees": []
} */

    function getTimezoneOffset(date: Date, tzid: string): number {
        // Get the timezone offset in minutes
        const eventDate = new Date(date.toLocaleString('en-US', { timeZone: tzid }));
        const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
        return (utcDate.getTime() - eventDate.getTime()) / (60 * 1000);
      }
      

export function recur_event(dateEvent: any) {
	if (!dateEvent.rrule) {
		return [dateEvent];
	}

  // Get the original dateEvent times
  const originalStart = new Date(dateEvent.start);
  const originalEnd = new Date(dateEvent.end);
  
  // Calculate duration
  const duration = originalEnd.getTime() - originalStart.getTime();

  // Get the hour and minute from the original start time
  const startHour = originalStart.getHours();
  const startMinute = originalStart.getMinutes();

  // Create RRule options with the original start date
  const rruleOptions: any = {
    ...dateEvent.rrule.options,
    dtstart: new Date(dateEvent.rrule.options.dtstart),
    until: new Date(dateEvent.rrule.options.until),
  }

  const rule = new RRule(rruleOptions);
  const dates = rule.all();

  return dates.map(date => {
    // https://github.com/jkbrzt/rrule?tab=readme-ov-file#important-use-utc-dates
    // > THE BOTTOM LINE: Returned "UTC" dates are always meant to be interpreted as dates in your local timezone.
    // > This may mean you have to do additional conversion to get the "correct" local time with offset applied.

    // convert from UTC to local timezone
    date = DateTime.fromJSDate(date)
        .toUTC()
        .setZone('local', { keepLocalTime: true })
        .toJSDate()
    
    // Create new date objects and set the correct hours and minutes
    const startDate = new Date(date);
    startDate.setHours(startHour, startMinute);
    
    const endDate = new Date(startDate.getTime() + duration);

    return {
      ...dateEvent,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      rrule: undefined
    };
  });


	/* // Get the original dateEvent times
    const originalStart = new Date(dateEvent.start);
    const originalEnd = new Date(dateEvent.end);
    
    // Calculate duration
    const duration = originalEnd.getTime() - originalStart.getTime();
  
    // Get the hour and minute from the original start time
    const startHour = originalStart.getUTCHours();
    const startMinute = originalStart.getUTCMinutes();
  
    // Create RRule options
    const rruleOptions = {
      ...dateEvent.rrule.options,
      dtstart: originalStart
    };
  
    if (rruleOptions.until) {
      rruleOptions.until = new Date(rruleOptions.until);
    }
  
    const rule = new RRule(rruleOptions);
    const dates = rule.all();
  
    return dates.map(date => {
      // Create new date objects and set the correct hours and minutes
      const startDate = new Date(date);
      startDate.setUTCHours(startHour, startMinute);
      
      const endDate = new Date(startDate.getTime() + duration);
  
      return {
        ...dateEvent,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        rrule: undefined
      };
    }); */
}
