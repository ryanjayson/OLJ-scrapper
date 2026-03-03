const ONLINE_JOBS_SEARCH_URL = "https://www.onlinejobs.ph/jobseekers/jobsearch";

export const getStringQueryParam = (query, key) => {
  const value = query?.[key];
  return typeof value === "string" ? value.trim() : "";
};

export const buildOnlineJobsSearchUrl = (keyword) => {
  if (!keyword) {
    return ONLINE_JOBS_SEARCH_URL;
  }

  const params = new URLSearchParams({ jobkeyword : keyword });
  return `${ONLINE_JOBS_SEARCH_URL}?${params.toString()}&skill_tags=`;

};

const parseInputDate = (value, isEndDate = false) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (isEndDate) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }

  return date;
};

const parsePostedDate = (datePostedText) => {
  if (!datePostedText) {
    return null;
  }

  const raw = datePostedText.trim();
  const normalized = raw
    .replace(/^posted\s*/i, "")
    .replace(/^on\s*/i, "")
    .trim()
    .toLowerCase();

  const now = new Date();

  if (normalized.includes("today")) {
    return new Date(now);
  }

  if (normalized.includes("yesterday")) {
    const date = new Date(now);
    date.setDate(date.getDate() - 1);
    return date;
  }

  const daysAgoMatch = normalized.match(/(\d+)\s+days?\s+ago/);
  if (daysAgoMatch) {
    const daysAgo = Number(daysAgoMatch[1]);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    return date;
  }

  if (/\d+\s+(hours?|minutes?)\s+ago/.test(normalized)) {
    return new Date(now);
  }

  const absoluteDate = new Date(raw.replace(/^posted\s*/i, "").replace(/^on\s*/i, "").trim());
  if (!Number.isNaN(absoluteDate.getTime())) {
    return absoluteDate;
  }

  return null;
};

const formatPostedDate = (date) => {
  if (!date) {
    return "";
  }

  const datePart = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${datePart} ${timePart}`;
};

export const extractJobsFromHtml = ($, startDate, endDate) => {
  const fromDate = parseInputDate(startDate, false);
  const toDate = parseInputDate(endDate, true);

  const jobs = [];
  $(".results .jobpost-cat-box").each((i, el) => {
    const datePosted = $(el).find("a").find("[data-temp]").text().trim();
    const postedDate = parsePostedDate(datePosted);

    if (fromDate || toDate) {
      if (!postedDate) {
        return;
      }

      if (fromDate && postedDate < fromDate) {
        return;
      }

      if (toDate && postedDate > toDate) {
        return;
      }
    }

    
    const title = $(el).find("a").find("h4")
      .contents()
      .filter((_, el) => el.type === "text")
      .text()
      .trim();
    
    const priceText =  $(el).find("dl.no-gutters dd").text().trim();
    const amount = priceText.match(/\d+/)?.[0];
    const payRate = $(el).find("a").last()
  
      
    jobs.push({
      title: title,
      url: $(el).find("a").attr("href"),
      datePosted: postedDate ? formatPostedDate(postedDate) : datePosted,
      payRate: priceText,
    });
  });

  return jobs;
};
