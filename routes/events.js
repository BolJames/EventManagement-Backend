import express from "express";
import db from "../db.js";
import { authMiddleware, adminMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

// Create event (admin only)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  const { title, date, description, price } = req.body; // ✅ added price

  if (!title || !date || !description || !price) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    await db.promise().query(
      "INSERT INTO events (title, date, description, price) VALUES (?, ?, ?, ?)",
      [title, date, description, price]
    );
    res.json({ message: "Event created successfully" });
  } catch (error) {
    console.error("Event Creation Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// List events (all users)
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT * FROM events ORDER BY date ASC");
    res.json(rows);
  } catch (error) {
    console.error("Fetch Events Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Step 3: Get event details for booking (pricing + payment)
router.get("/:id", authMiddleware, async (req, res) => {
  const eventId = req.params.id;

  try {
    const [rows] = await db.promise().query("SELECT * FROM events WHERE id = ?", [eventId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    const event = rows[0];
    res.json(event); // send event details to frontend (booking.html)
  } catch (error) {
    console.error("Fetch Event Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Final booking confirmation (user)
router.post("/:id/book", authMiddleware, async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  try {
    // check if already booked
    const [existing] = await db.promise().query(
      "SELECT * FROM bookings WHERE user_id = ? AND event_id = ?",
      [userId, eventId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "You already booked this event" });
    }

    await db.promise().query(
      "INSERT INTO bookings (user_id, event_id) VALUES (?, ?)",
      [userId, eventId]
    );
    res.json({ message: "Booking confirmed successfully ✅" });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
