const pupeteer = require("puppeteer");

const getImgUrl = (cachedHtml) => {
  let url = "";

  const regexMatch = cachedHtml.match(
    /(?<=src=")([^"]+)(\.jpg|\.png|\.jpeg|\.gif)/
  );
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

  getResult: async (postCount) => {
    let results = [];

    do {
      let nextResults = await self.parseResults();

      results = [...results, ...nextResults];

      const nextPageBtn = await self.page.$("span.next-button > a");

      if (nextPageBtn && results.length < postCount) {
        await nextPageBtn.click();
        await self.page.waitForNavigation({ waitUntill: "networkidle0" });
      } else {
        break;
      }
    } while (results.length < postCount);

    return results.slice(0, postCount);
  },

  parseResults: async () => {
    const results = [];

    try {
      const elements = await self.page.$$('#siteTable > div[class*="thing"]');

      for (let element of elements) {
        const title = await element.$eval("p.title > a", (node) =>
          node.innerText.trim()
        );
        const score = await element.$eval("div.score.likes", (node) =>
          node.innerText.trim()
        );

        let cachedHtml = "";
        const expandHandler = await element.$(
          "div.expando.expando-uninitialized"
        );
        if (expandHandler) {
          const data = await expandHandler.evaluate((el) =>
            el.getAttribute("data-cachedhtml")
          );

          if (data) cachedHtml = data;
        }

        const imgUrl = getImgUrl(cachedHtml);

        results.push({
          title,
          score,
          imgUrl,
        });
      }
    } catch (e) {
      console.log(`parseResult error`);
      console.log(e);
    }

    return results;
  },
};

module.exports = self;
