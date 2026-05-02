import express from "express";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
    res.send("MFB System Core is running");
});

app.listen(PORT, () => {
    console.log(`Fake web server running on port ${PORT}`);
});
