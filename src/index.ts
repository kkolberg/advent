import moment from 'moment';

import { Marbles } from './dayNine';

let starttime = moment();
Marbles.getScore().then((result) => {
    let endtime = moment();
    console.log("time took: " + endtime.diff(starttime, "milliseconds").toString());
    console.log("answer: " + result)
});