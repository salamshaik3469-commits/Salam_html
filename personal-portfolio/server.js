const path = require("path");
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false }
}) : null;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const fallbackProjects = [
  { id: 1, title: "AI Study Assistant", description: "A student-focused assistant concept for answering questions and organizing study resources.", tech: ["AI/ML", "JavaScript", "API"] },
  { id: 2, title: "Weather Dashboard", description: "A responsive dashboard that presents live weather information in a clear, mobile-friendly interface.", tech: ["HTML", "CSS", "JavaScript"] },
  { id: 3, title: "Data Structures Visualizer", description: "Interactive visual explanations for stacks, queues, trees and graph traversals.", tech: ["JavaScript", "Algorithms", "UI"] }
];

app.get("/api/health", async (_req, res) => {
  if (!pool) return res.json({ status: "ok", database: "not configured" });
  try { await pool.query("SELECT 1"); res.json({ status: "ok", database: "connected" }); }
  catch { res.status(503).json({ status: "ok", database: "unavailable" }); }
});

app.get("/api/projects", async (_req, res) => {
  if (!pool) return res.json(fallbackProjects);
  try {
    const { rows } = await pool.query("SELECT id, title, description, tech FROM projects ORDER BY id DESC");
    res.json(rows.length ? rows : fallbackProjects);
  } catch { res.json(fallbackProjects); }
});

app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ error: "Please complete all fields." });
  if (!pool) return res.status(503).json({ error: "Contact storage is not configured yet. Add DATABASE_URL and restart the server." });
  try {
    await pool.query("INSERT INTO messages (name, email, message) VALUES ($1, $2, $3)", [name.trim(), email.trim(), message.trim()]);
    res.status(201).json({ message: "Thanks! Your message was saved." });
  } catch (error) { console.error(error); res.status(500).json({ error: "Could not save your message." }); }
});

app.get("/{*splat}", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log(`Portfolio running on http://localhost:${PORT}`));
