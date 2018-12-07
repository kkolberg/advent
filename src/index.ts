import moment from 'moment';

import { StepDepends } from './daySeven';

let starttime = moment();
StepDepends.getHelperTime().then((result) => {
    let endtime = moment();
    console.log("time took: " + endtime.diff(starttime, "milliseconds").toString());
    console.log("answer: " + result)
});