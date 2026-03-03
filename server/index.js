import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

app.get("/api/onlinejobs", async (req, res) => {
  const keyword = typeof req.query.keyword === "string" ? req.query.keyword : "";   

  const targetUrl = "https://www.onlinejobs.ph/jobseekers/jobsearch";
  const urlWithQuery =
    keyword.trim().length > 0
      ? `${targetUrl}?keyword=${encodeURIComponent(keyword)}`
      : targetUrl;

  try {
    const response = await fetch(targetUrl, {
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

    // Get first element with class "result"
    // const result = $(".results").first().text();

    const jobs = [];

    $(".results .jobpost-cat-box").each((i, el) => {
      const title = $(el).find("a").find("h4")
        .contents()
        .filter((_, el) => el.type === "text")
        .text()
        .trim();

      jobs.push({
        title: title,
        url: $(el).find("a").attr("href"),
        datePosted:  $(el).find("a").find("[data-temp]").text().trim(),
      });
    });

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

