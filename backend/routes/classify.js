
import { OpenAI } from "openai"; // or from langchain in later versions
import express from "express";
import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

const router = express.Router();

const categoryList = ["Important", "Promotions", "Social", "Marketing", "Spam", "General"];

const prompt = `
You are an email classifier. Given an email with subject and body, choose the best single category from:
Important, Promotions, Social, Marketing, Spam, General.

Return JSON only in the following format:
{"category":"<one of the six categories>", "reason":"<1-sentence reason>"}

Email:
Subject: {subject}
Body: {body}
`;

router.post("/", async (req, res) => {
  // Expected body: { emails: [{id, subject, body,...}, ...], openaiKey: "<user-provided-key>" }
  const { emails, openaiKey } = req.body;
  if (!emails || !Array.isArray(emails)) return res.status(400).json({ error: "emails required" });

  if (!openaiKey) return res.status(400).json({ error: "openaiKey required" });

  try {
    // Use OpenAI client directly with the user's key (Langchain can be used but direct call works too)
    const client = new OpenAI({ apiKey: openaiKey });

    // For each email, call OpenAI with the prompt
    const results = [];
    for (const e of emails) {
      const filledPrompt = prompt.replace("{subject}", e.subject || "").replace("{body}", e.body || e.snippet || "");
      const response = await client.responses.create({
        model: "gpt-4o", // or gpt-4o-mini, replace as needed
        input: filledPrompt,
        max_output_tokens: 200
      });

      // The response format depends on SDK. Try to get text:
      const text = response.output?.[0]?.content?.[0]?.text ?? (response.output_text || "");
      // Try parse JSON
      let parsed = { category: "General", reason: "Could not parse response" };
      try {
        const jsonStr = text.trim().replace(/\n/g, " ");
        parsed = JSON.parse(jsonStr);
      } catch (parseErr) {
        // fallback: try to extract category word
        const found = categoryList.find(c => text.includes(c));
        parsed = { category: found || "General", reason: text.slice(0, 200) };
      }

      results.push({
        id: e.id,
        subject: e.subject,
        snippet: e.snippet,
        category: parsed.category,
        reason: parsed.reason
      });
    }

    res.json({ classified: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

export default router;
