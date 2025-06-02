interface YouTubeVideoInfo {
  title: string;
  author: string;
  thumbnail: string;
  videoId: string;
  lengthSeconds: number;
  isLiveContent: boolean;
}

interface SearchResult {
  url: string;
  title: string;
  videoId: string;
}

// Constants
const YT_VIDEO_ID_REGEX =
  /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
const YT_PLAYLIST_REGEX = /[?&]list=/;

// Utility Functions
export function extractVideoId(url: string): string | null {
  const match = url.match(YT_VIDEO_ID_REGEX);
  return match ? match[1] : null;
}

export function isPlaylistUrl(url: string): boolean {
  return YT_PLAYLIST_REGEX.test(url);
}

export function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const [, h, m, s] = match.map((v) => parseInt(v || "0"));
  return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
}

// API-Based Implementations
async function searchYouTubeAPI(
  query: string,
  apiKey: string,
): Promise<SearchResult | null> {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const item = data.items?.[0];

    if (!item) return null;

    return {
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      title: item.snippet.title,
      videoId: item.id.videoId,
    };
  } catch (err) {
    console.error("[API] YouTube search error:", err);
    return null;
  }
}

async function getVideoInfoAPI(
  videoId: string,
  apiKey: string,
): Promise<YouTubeVideoInfo | null> {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,liveStreamingDetails&id=${videoId}&key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const item = data.items?.[0];

    if (!item) return null;

    const { title, channelTitle, thumbnails, liveBroadcastContent } =
      item.snippet;
    const isLive =
      liveBroadcastContent === "live" || !!item.liveStreamingDetails;
    const duration = parseDuration(item.contentDetails.duration);

    return {
      title,
      author: channelTitle,
      thumbnail: thumbnails.high?.url || thumbnails.default?.url,
      videoId,
      lengthSeconds: duration,
      isLiveContent: isLive,
    };
  } catch (err) {
    console.error("[API] YouTube video info error:", err);
    return null;
  }
}

// Scraper-Based Implementations (Fallback)
async function searchYouTubeScraper(
  query: string,
): Promise<SearchResult | null> {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });
    const html = await res.text();

    const match = html.match(/var ytInitialData = ({.*?});<\/script>/);
    if (!match) return null;

    const data = JSON.parse(match[1]);
    const contents =
      data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
        ?.sectionListRenderer?.contents;

    for (const section of contents || []) {
      const items = section?.itemSectionRenderer?.contents;
      for (const item of items || []) {
        const video = item.videoRenderer;
        if (video) {
          return {
            url: `https://www.youtube.com/watch?v=${video.videoId}`,
            title: video.title.runs[0].text,
            videoId: video.videoId,
          };
        }
      }
    }
    return null;
  } catch (err) {
    console.error("[Scraper] YouTube search error:", err);
    return null;
  }
}

async function getVideoInfoScraper(
  videoId: string,
): Promise<YouTubeVideoInfo | null> {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });
    const html = await res.text();

    const match = html.match(
      /var ytInitialPlayerResponse = ({.*?});<\/script>/,
    );
    if (!match) return null;

    const data = JSON.parse(match[1]);
    const details = data.videoDetails;

    return {
      title: details.title,
      author: details.author,
      thumbnail: details.thumbnail.thumbnails.slice(-1)[0].url,
      videoId: details.videoId,
      lengthSeconds: parseInt(details.lengthSeconds) || 0,
      isLiveContent: details.isLiveContent || false,
    };
  } catch (err) {
    console.error("[Scraper] YouTube video info error:", err);
    return null;
  }
}

// Public API
export async function searchYouTube(
  query: string,
  apiKey?: string,
): Promise<SearchResult | null> {
  return apiKey
    ? (await searchYouTubeAPI(query, apiKey)) ||
        (await searchYouTubeScraper(query))
    : await searchYouTubeScraper(query);
}

export async function getYouTubeVideoInfo(
  videoIdOrUrl: string,
  apiKey?: string,
): Promise<YouTubeVideoInfo | null> {
  const videoId = extractVideoId(videoIdOrUrl) || videoIdOrUrl;
  return apiKey
    ? (await getVideoInfoAPI(videoId, apiKey)) ||
        (await getVideoInfoScraper(videoId))
    : await getVideoInfoScraper(videoId);
}
