export async function scrapeUrls(
  urls: string[]
) {
  const pages = await Promise.all(
    urls.map(async (url) => {
      const res = await fetch(
        "https://api.firecrawl.dev/v1/scrape",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            formats: ["markdown"],
          }),
        }
      );

      return res.json();
    })
  );

  return pages;
}