const pupeteer = require("puppeteer");

const getRedditUrl = (subreddit) =>
  // `https://old.reddit.com/r/${subreddit}/`;
  `https://old.reddit.com/r/${subreddit}/top?sort=top&t=all`;

const getImgUrl = async (img) => {
  try {
    let imgUrl = "";

    if (img != null) {
      const propertyHandle = await img.getProperty("src");
      imgUrl = await propertyHandle.jsonValue();

      imgUrl = imgUrl.replace("preview", "i");
    }

    //trim sizing params
    if (imgUrl.indexOf("?") !== -1)
      imgUrl = imgUrl.slice(0, imgUrl.indexOf("?"));

    return imgUrl;
  } catch (e) {
    console.log(`getImg error`);
    console.log(e);
    return "";
  }
};

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
        // Expand post, to get img
        const expandBtn = await element.$('div[class*="expando-button"]');
        console.log(expandBtn);
        if (expandBtn != null) expandBtn.click();

        const title = await element.$eval('p[class="title"] > a', (node) =>
          node.innerText.trim()
        );
        const score = await element.$eval('div[class="score likes"]', (node) =>
          node.innerText.trim()
        );

        const img = await element.$('img[class="preview"]');

        if (expandBtn) expandBtn.click();
        console.log(img);

        let imgUrl = await getImgUrl(img);

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
