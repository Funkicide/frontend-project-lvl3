/* eslint-disable no-param-reassign */
import onChange from 'on-change';

const renderStatus = ({ input, statusBar }, status) => {
  input.classList.remove('is-invalid');
  statusBar.classList.remove('text-danger');
  statusBar.classList.add('text-success');

  statusBar.textContent = status;
};

const renderErrors = ({ input, statusBar }, error) => {
  statusBar.classList.remove('text-success');
  input.classList.add('is-invalid');
  statusBar.classList.add('text-danger');

  statusBar.textContent = error;
};

const renderFeed = (elements, headerText, { data: { feeds } }) => {
  elements.feeds.innerHTML = '';

  const feedsContainer = document.createElement('div');
  feedsContainer.classList.add('card', 'border-0');

  const feedsHeaderContainer = document.createElement('div');
  feedsHeaderContainer.classList.add('card-body');
  const feedsHeader = document.createElement('h2');
  feedsHeader.classList.add('card-title', 'h4');
  feedsHeader.textContent = headerText;
  feedsHeaderContainer.prepend(feedsHeader);

  const feedsList = document.createElement('ul');
  feedsList.classList.add('list-group', 'border-0', 'rounded-0');
  const feedsElements = feeds.map(({ title, description }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const header = document.createElement('h3');
    header.classList.add('h6', 'm-0');
    header.textContent = title;

    const descBox = document.createElement('p');
    descBox.classList.add('m-0', 'small', 'text-black-50');
    descBox.textContent = description;

    li.prepend(header, descBox);

    return li;
  });

  feedsList.prepend(...feedsElements);
  feedsContainer.append(feedsHeaderContainer, feedsList);
  elements.feeds.append(feedsContainer);

  elements.form.reset();
  elements.input.focus();
};

const renderPosts = ({ posts }, buttonText, headerText, state) => {
  posts.innerHTML = '';

  const postsContainer = document.createElement('div');
  postsContainer.classList.add('card', 'border-0');

  const postsHeaderContainer = document.createElement('div');
  postsHeaderContainer.classList.add('card-body');
  const postsHeader = document.createElement('h2');
  postsHeader.classList.add('card-title', 'h4');
  postsHeader.textContent = headerText;
  postsHeaderContainer.prepend(postsHeader);

  const postsList = document.createElement('ul');
  postsList.classList.add('border-0', 'rounded-0');
  postsList.classList.add('list-group');
  const postsElements = state.data.posts.map(({
    title, link, id,
  }) => {
    const li = document.createElement('li');
    const currentPost = state.uiState.posts.find((post) => post.id === id);
    const currentFontWeight = currentPost.status === 'read' ? 'fw-normal' : 'fw-bold';
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const a = document.createElement('a');
    a.classList.add(currentFontWeight);
    a.href = link;
    a.textContent = title;
    a.dataset.id = id;
    a.target = '_blank';

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.textContent = buttonText;
    button.dataset.id = id;
    li.append(a, button);

    return li;
  });

  postsList.prepend(...postsElements);
  postsContainer.append(postsHeaderContainer, postsList);
  posts.append(postsContainer);
};

export default ({ state, elements, i18nextInstance }) => {
  const watchedState = onChange(state, (path, value) => {
    if (path === 'processState' && value === 'loading') {
      elements.input.disabled = true;
      elements.submitButton.disabled = true;
      renderStatus(elements, i18nextInstance.t('processState.loading'));
    }
    if (path === 'processState' && value === 'loaded') {
      elements.input.disabled = false;
      elements.submitButton.disabled = false;
      renderStatus(elements, i18nextInstance.t('processState.loaded'));
      renderFeed(elements, i18nextInstance.t('feedsHeader'), state);
      renderPosts(elements, i18nextInstance.t('postPreviewButton'), i18nextInstance.t('postsHeader'), watchedState);
    }
    if (path === 'processState' && value === 'updated') {
      renderPosts(elements, i18nextInstance.t('postPreviewButton'), i18nextInstance.t('postsHeader'), watchedState);
    }
    if (path === 'activePost' && value.status === 'read') {
      renderPosts(elements, i18nextInstance.t('postPreviewButton'), i18nextInstance.t('postsHeader'), watchedState);
    }
    if (path === 'processState' && value === 'failed') {
      elements.input.disabled = false;
      elements.submitButton.disabled = false;
      renderErrors(elements, i18nextInstance.t(state.rssForm.error));
    }
  });

  return watchedState;
};
