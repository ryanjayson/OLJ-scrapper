import express from "express";
import cors from "cors";
import * as cheerio from "cheerio";
import { buildOnlineJobsSearchUrl, getStringQueryParam, extractJobsFromHtml, fetchHtmlFromUrl, extractJobsPages} from "./helpers.js";

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
    const response = await fetchHtmlFromUrl(urlWithQuery);

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: `Upstream error: ${response.status}` });
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    let jobs = [];
    const initialListJobs = extractJobsFromHtml($, startDate, endDate);
    jobs = initialListJobs;

    const totalPages = extractJobsPages($);
    console.log(totalPages);
    
    for (let page = 2; page <= totalPages; page++) {
      const jobsToDisplay = page * 30;
    
      const pagedUrlWithQuery = buildOnlineJobsSearchUrl(keyword, jobsToDisplay);
      console.log(pagedUrlWithQuery);
    
      const pagedResponse = await fetchHtmlFromUrl(pagedUrlWithQuery);
    
      if (!pagedResponse.ok) {
        return res
          .status(pagedResponse.status)
          .json({ error: `Upstream error: ${pagedResponse.status}` });
      }
    
      const pagedHtml = await pagedResponse.text();
      const $$ = cheerio.load(pagedHtml);
    
      const pagedListJobs = extractJobsFromHtml($$, startDate, endDate);
    
      // If you are collecting results:
      jobs.push(...pagedListJobs);
    }
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

