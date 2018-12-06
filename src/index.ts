import moment from 'moment';

import { GridPlaces } from './daySix';

let starttime = moment();
GridPlaces.getLargestArea().then((result) => {
    let endtime = moment();
    console.log("time took: " + endtime.diff(starttime, "milliseconds").toString());
    console.log("answer: " + result)
});