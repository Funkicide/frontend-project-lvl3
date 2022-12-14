import axios from 'axios';
import makeProxyUrl from './makeProxyUrl.js';
import parseData from './parseData.js';
import addIds from './addIds.js';

const autoupdate = (watchedState, delay = 5000) => {
  const promises = watchedState.data.activeFeeds.map((item) => {
    watchedState.processState = 'updating';
    return axios.get(makeProxyUrl(item))
      .then(({ data }) => parseData(data.contents))
      .then((parsedRss) => {
        addIds(watchedState, parsedRss);
        watchedState.processState = 'updated';
      })
      .catch((error) => console.log(error.message));
  });
  Promise.all(promises)
    .finally(() => setTimeout(() => autoupdate(watchedState), delay));
};

export default autoupdate;
