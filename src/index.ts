import moment from 'moment';

import { LocationData } from './dayEight';

let starttime = moment();
LocationData.addNodes().then((result) => {
    let endtime = moment();
    console.log("time took: " + endtime.diff(starttime, "milliseconds").toString());
    console.log("answer: " + result)
});