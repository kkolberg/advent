import moment from 'moment';

import { PowerGrid } from './dayEleven';

let starttime = moment();
PowerGrid.findAwesomeBox().then((result) => {
    let endtime = moment();
    console.log("time took: (milliseconds) " + endtime.diff(starttime, "milliseconds").toString());
    console.log("time took: (seconds) " + endtime.diff(starttime, "seconds").toString());
    console.log("answer: " + result)
});