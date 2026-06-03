// api/banRoutes.js
import express from "express";
import { GetBan } from "../db.js";

const router = express.Router();
router.use(express.json());

const API_KEY = process.env.ROBLOX_API_KEY;

router.post("/checkBan", async (req, res) => {
  const key = req.headers["authorization"];
  if (key !== API_KEY) return res.status(403).json({ error: "Forbidden" });

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  const ban = await GetBan(userId);
  if (!ban) return res.json({ banned: false });

  return res.json({
    banned: true,
    reason: ban.reason,
    moderator: ban.moderator
  });
});

export default router;
