const express = require('express')
const app = express()
const port = 8080;
const path = require("path");

app.use("/static", express.static("static", { extensions: ["js"] }));

app.get('/', (req, res) => {
  const filePath = path.join(__dirname, "./static/index.html");
  res.sendFile(filePath);
})

app.get('/postCard', (req, res)=> {
    res.sendFile(path.join(__dirname, "./static/postCard.js"));
})

app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, './static/style.css')); // Serve your CSS file
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
})
