const parseData = (data) => {
  const parser = new DOMParser();
  const parsedRss = parser.parseFromString(data, 'text/xml');
  const parserError = parsedRss.querySelector('parsererror');

  if (parserError) {
    throw new Error('errors.url.noRss');
  }

  const feedTitleElement = parsedRss.querySelector('title');
  const feedDescriptionElement = parsedRss.querySelector('description');
  const feedTitle = feedTitleElement.textContent;
  const feedDescription = feedDescriptionElement.textContent;

  const feed = {
    title: feedTitle,
    description: feedDescription,
  };

  const itemElements = parsedRss.querySelectorAll('item');
  const posts = [...itemElements].map((item) => {
    const titleElement = item.querySelector('title');
    const linkElement = item.querySelector('link');
    const descriptionElement = item.querySelector('description');
    const title = titleElement.textContent;
    const link = linkElement.textContent;
    const description = descriptionElement.textContent;

    return {
      title,
      link,
      description,
    };
  });

  return { feed, posts };
};

export default parseData;
