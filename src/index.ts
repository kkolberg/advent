import moment from 'moment';

import { Stars } from './25';

let starttime = moment();
Stars.run().then((result) => {
    let endtime = moment();
    console.log("time took: (milliseconds) " + endtime.diff(starttime, "milliseconds").toString());
    console.log("time took: (seconds) " + endtime.diff(starttime, "seconds").toString());
    console.log("answer: " + result)
});