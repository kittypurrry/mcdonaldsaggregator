import moment from "moment";

export const getTimeDifference = (comparisonDates: Date[]) => {
    let a = moment(comparisonDates[0]); //now
    let b = moment(comparisonDates[1]);
    let returnedString = '';
  
    if (a.diff(b, 'hours') > 24) {
      if (a.diff(b, 'days') > 7) {
        returnedString = `${a.diff(b, 'weeks')}w`;
      } else {
        returnedString = `${a.diff(b, 'days')}d`;
      }
    } else if (a.diff(b, 'hours') == 0) {
      returnedString = 'now';
    } else {
      returnedString = `${a.diff(b, 'hours')}h`;
    }
  
    return returnedString;
  };
  