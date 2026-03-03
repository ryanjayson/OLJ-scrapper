import React, { useState } from "react";

interface jobResult {
  id: number;
  title: string;
  snippet: string;
  url: string;
  datePosted : string;
}

const DOMAIN : string= "https://www.onlinejobs.ph";

export const App: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<jobResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setError(null);
    setResults([]);

    if (!keyword.trim()) {
      setError("Please enter a keyword to search.");
      return;
    }

    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        keyword: keyword.trim(),
      });

      if (startDate) {
        params.set("startDate", startDate);
      }

      if (endDate) {
        params.set("endDate", endDate);
      }

      const response = await fetch(
        `/api/onlinejobs?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data: { jobs: jobResult[]; url: string } = await response.json();

      setResults(data.jobs)
      
    } catch (err) {
      setError("Failed to fetch OnlineJobs.ph via proxy.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>OLJ Web Scraper</h1>
        <p>Search the web by keyword and view scraped results.</p>
      </header>

      <section className="search-section">
        <label className="field-label" htmlFor="keyword-input">
          Keyword
        </label>
        <div className="search-row">
          <input
            id="keyword-input"
            className="search-input"
            type="text"
            placeholder="Enter keyword to scrape..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="search-button"
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
        <div className="search-row">
          <div className="date-field">
            <label className="field-label" htmlFor="start-date-input">
              From
            </label>
            <input
              id="start-date-input"
              className="search-input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="date-field">
            <label className="field-label" htmlFor="end-date-input">
              To
            </label>
            <input
              id="end-date-input"
              className="search-input"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        {error && <p className="error-text">{error}</p>}
      </section>

      <section className="results-section">
        <h2>Results</h2>
        {isLoading && <p className="muted">Fetching data...</p>}
        {!isLoading && results.length === 0 && !error && (
          <p className="muted">
            No results yet. Enter a keyword and press Search.
          </p>
        )}

        {!isLoading && results.length > 0 && (
          <ul className="results-list">
            {results.map((result, index) => (
              <li key={index} className="result-item">
                <a
                  href={`${DOMAIN + result.url} `}
                  target="_blank"
                  rel="noreferrer"
                  className="result-title"
                >
                  {result.title}
                </a>
                <p className="result-snippet">{result.snippet}</p>
                <p className="result-url">{result.datePosted}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

