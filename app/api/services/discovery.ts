export async function discoverVendor(
  vendor: string
) {
  const queries = [
    `${vendor} trustpilot`,
    `${vendor} reddit`,
    `${vendor} scam`,
    `${vendor} complaints`,
    `${vendor} reviews`,
    `${vendor} instagram`,
    `${vendor} facebook`,
  ];

  const results = await Promise.all(
    queries.map(async (q) => {
      const res = await fetch(
        `https://api.firecrawl.dev/search?q=${encodeURIComponent(
          q
        )}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
          },
        }
      );

      return res.json();
    })
  );

  return results.flat();
}