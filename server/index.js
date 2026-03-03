import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { buildOnlineJobsSearchUrl, getStringQueryParam, extractJobsFromHtml } from "./helpers.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

app.get("/api/onlinejobs", async (req, res) => {
  const keyword = getStringQueryParam(req.query, "keyword");
  const startDate = getStringQueryParam(req.query, "startDate");
  const endDate = getStringQueryParam(req.query, "endDate");


  const urlWithQuery = buildOnlineJobsSearchUrl(keyword);
  console.log(urlWithQuery);
  try {
    const response = await fetch(urlWithQuery, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: `Upstream error: ${response.status}` });
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    console.log($);


    const jobs = extractJobsFromHtml($, startDate, endDate);
    console.log(jobs);

    res.json({ jobs, url: urlWithQuery });
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Failed to fetch OnlineJobs.ph" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on http://localhost:${PORT}`);
});

