import { isEmpty, differenceBy, uniqueId } from 'lodash';

const addIds = (state, { feed, posts }) => {
  if (isEmpty(state.data.feeds)) {
    state.data.feeds.push({ ...feed, id: uniqueId() });
  } else {
    const currentFeed = state.data.feeds
      .find((item) => item.title === feed.title);
    if (!currentFeed) {
      state.data.feeds.unshift({ ...feed, id: uniqueId() });
    }
  }

  const currentFeed = state.data.feeds.find((item) => item.title === feed.title);
  const feedId = currentFeed.id;
  const postsWithIds = posts.map((item) => ({ ...item, feedId, id: uniqueId() }));

  const currentFeedPosts = state.data.posts.filter((post) => post.feedId === feedId);
  const newPosts = differenceBy(postsWithIds, currentFeedPosts, 'title');
  const newPostsUiState = newPosts.map(({ id }) => ({ id, status: 'unread' }));
  state.uiState.posts = isEmpty(state.uiState.posts)
    ? newPostsUiState
    : [...newPostsUiState, ...state.uiState.posts];
  state.data.posts = isEmpty(state.data.posts) ? postsWithIds : [...newPosts, ...state.data.posts];
};

export default addIds;
