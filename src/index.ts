import moment from 'moment';

import { Assembly } from './19';

let starttime = moment();
Assembly.tree().then((result) => {
    let endtime = moment();
    console.log("time took: (milliseconds) " + endtime.diff(starttime, "milliseconds").toString());
    console.log("time took: (seconds) " + endtime.diff(starttime, "seconds").toString());
    console.log("answer: " + result)
});