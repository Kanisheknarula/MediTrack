const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

// ML API endpoint
router.post("/check-mrl", async (req, res) => {
    try {
        const input = req.body;

        const response = await fetch("http://localhost:8001/predict_mrl", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input)
        });

        const data = await response.json();
        res.json(data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
