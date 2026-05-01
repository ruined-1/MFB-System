import express from 'express';
const app = express();

app.get('/', (req, res) => {
  res.send('Bot is alive');
});

app.listen(10000, () => {
  console.log('Fake web server running on port 10000');
});
