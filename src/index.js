const reddit = require('./reddit');

(async () => {
  const subreddit = 'node';
  await reddit.initialize(subreddit);
  await reddit.getResult();
  debugger;
})()