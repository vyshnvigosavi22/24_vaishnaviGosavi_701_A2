const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/api/country/:code", async (req, res) => {
  const code = req.params.code;
  try {
    const response = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
    const data = await response.json();
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch country data" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
