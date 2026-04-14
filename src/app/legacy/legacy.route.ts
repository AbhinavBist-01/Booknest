import express from "express";
import { Router } from "express";
import pg from "pg";
import { authMiddleware } from "../auth/middlewares/middleware";

const legacySeatRouter = express.Router() as Router;
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

legacySeatRouter.get("/seats", async (_req, res) => {
  const result = await pool.query("select * from seats");
  return res.json(result.rows);
});

legacySeatRouter.put("/:id/:name", authMiddleware, async (req, res) => {
  const conn = await pool.connect();
  try {
    const id = req.params.id;
    const name = req.params.name;

    await conn.query("BEGIN");

    const seat = await conn.query(
      "SELECT * FROM seats where id = $1 and isbooked = 0 FOR UPDATE",
      [id],
    );

    if (seat.rowCount === 0) {
      await conn.query("ROLLBACK");
      return res.status(409).json({ error: "Seat already booked" });
    }

    const updated = await conn.query(
      "update seats set isbooked = 1, name = $2 where id = $1",
      [id, name],
    );

    await conn.query("COMMIT");
    return res.json(updated.rows ?? updated);
  } catch (e) {
    await conn.query("ROLLBACK");
    return res.status(500).json({ error: "Booking failed" });
  } finally {
    conn.release();
  }
});

export { legacySeatRouter };
