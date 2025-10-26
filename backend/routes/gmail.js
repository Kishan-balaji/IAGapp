import express from "express";
import { google } from "googleapis";
const router = express.Router();

function getOAuthClient(userSession) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  if (!userSession || !userSession.accessToken) return null;
  oAuth2Client.setCredentials({ access_token: userSession.accessToken, refresh_token: userSession.refreshToken });
  return oAuth2Client;
}

// Fetch message list then details
router.get("/messages", async (req, res) => {
  // expects session populated by passport
  if (!req.session || !req.session.passport || !req.session.passport.user) {
    return res.status(401).json({ error: "not authenticated" });
  }
  const user = req.session.passport.user;
  const count = parseInt(req.query.count || "15", 10);

  const oAuth2Client = getOAuthClient(user);
  if (!oAuth2Client) return res.status(500).json({ error: "OAuth client not available" });

  try {
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
    // list messages
    const listRes = await gmail.users.messages.list({ userId: "me", maxResults: count });
    const messages = listRes.data.messages || [];

    // fetch message details (subject, snippet, body)
    const details = await Promise.all(messages.map(async (m) => {
      const msg = await gmail.users.messages.get({ userId: "me", id: m.id, format: "full" });
      const payload = msg.data.payload || {};
      const headers = payload.headers || [];
      const getHeader = (name) => (headers.find(h => h.name.toLowerCase() === name.toLowerCase()) || {}).value || "";

      // extract body plain text
      function getBody(part) {
        if (!part) return "";
        if (part.mimeType === "text/plain" && part.body && part.body.data) {
          return Buffer.from(part.body.data, "base64").toString("utf8");
        }
        if (part.parts && part.parts.length) {
          for (const p of part.parts) {
            const r = getBody(p);
            if (r) return r;
          }
        }
        return "";
      }
      const body = getBody(payload);
      return {
        id: m.id,
        threadId: msg.data.threadId,
        snippet: msg.data.snippet || "",
        subject: getHeader("Subject"),
        from: getHeader("From"),
        date: getHeader("Date"),
        body
      };
    }));

    res.json({ emails: details });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

export default router;
