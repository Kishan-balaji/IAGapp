import express from "express";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import gmailRoutes from "./routes/gmail.js";
import classifyRoutes from "./routes/classify.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

app.use(session({
  secret: process.env.SESSION_SECRET || "dev_secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set true if using https
}));

app.use("/auth", authRoutes);
app.use("/api/gmail", gmailRoutes);
app.use("/api/classify", classifyRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
