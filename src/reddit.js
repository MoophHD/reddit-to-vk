const pupeteer = require("puppeteer");

const getRedditUrl = (subreddit) => `https://old.reddit.com/r/${subreddit}/top?sort=top&t=all`;

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
    const elements = await self.page.$$('#siteTable > div[class*="thing"]');

    for (let element of elements) {
      const title = await element.$eval(('p[class="title"]'), node => node.innerText.trim());
      const score = await element.$eval(('div[class="score likes"]'), node => node.innerText.trim());

      console.log(`title ${title}`);
      console.log(`score ${score}`);
    }
  }
};

module.exports = self;
