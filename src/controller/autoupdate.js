import axios from 'axios';
import { isEmpty } from 'lodash';
import makeProxyUrl from './makeProxyUrl.js';
import parseData from './parseData.js';
import normalizeRss from './normalizeRss.js';

const autoupdate = (watchedState, milliseconds = 5000) => {
  if (isEmpty(watchedState.data.activeFeeds)) {
    setTimeout(() => autoupdate(watchedState), 0);
  } else {
    setTimeout(() => {
      const promises = watchedState.data.activeFeeds.map((item) => {
        watchedState.processState = 'updating';
        return axios.get(makeProxyUrl(item))
          .then(({ data }) => parseData(data.contents))
          .then((parsedRss) => {
            normalizeRss(watchedState, parsedRss);
            watchedState.processState = 'updated';
          });
      });
      Promise.allSettled(promises)
        .finally(() => autoupdate(watchedState));
    }, milliseconds);
  }
};

export default autoupdate;
