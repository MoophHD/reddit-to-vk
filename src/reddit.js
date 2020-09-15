const pupeteer = require("puppeteer");

const getImgUrl = (cachedHtml) => {
  let url = "";

  const regexMatch = cachedHtml.match(/(?<=src=")([^"]+)(\.jpg|\.png|\.jpeg|\.gif)/);
  if (regexMatch) {
    url = regexMatch[0];
    url = url.replace("preview", "i");
  }

  return url;
};

const getRedditUrl = (subreddit) =>
  `https://old.reddit.com/r/${subreddit}/top?sort=top&t=all`;

const self = {
  browser: null,
  page: null,

  initialize: async (subreddit) => {
    self.browser = await pupeteer.launch({ headless: false });
    self.page = await self.browser.newPage();

    await self.page.goto(getRedditUrl(subreddit), {
      waitUntill: "networkidle0",
    });
  },

  getResult: async (postsCount) => {
    try {
      const elements = await self.page.$$('#siteTable > div[class*="thing"]');

      for (let element of elements) {
        const title = await element.$eval('p.title > a', (node) =>
          node.innerText.trim()
        );
        const score = await element.$eval('div.score.likes', (node) =>
          node.innerText.trim()
        );


        let cachedHtml = '';
        if (await element.$('div.expando.expando-uninitialized') !== null) {
          cachedHtml = await element.$eval(
            'div.expando.expando-uninitialized',
            (el) => el.getAttribute("data-cachedhtml")
          );
        }
   
        const imgUrl = getImgUrl(cachedHtml);

        console.log(`title: ${title}`);
        console.log(`score: ${score}`);
        console.log(`imgUrl: ${imgUrl}`);
      }
    } catch (e) {
      console.log(`getResult error`);
      console.log(e);
    }
  },
};

module.exports = self;
