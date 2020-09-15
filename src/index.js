const reddit = require("./reddit");

(async () => {
  const subreddit = "node";
  const postCount = 50;

  await reddit.initialize(subreddit);
  const posts = await reddit.getResult(postCount);

  console.log(posts);
  debugger;
})();
