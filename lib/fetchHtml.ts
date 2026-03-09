import axios from "axios";

export async function fetchHtml(url: string): Promise<string> {
  const response = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 Website Audit Tool",
    },
    timeout: 15000,
  });

  return response.data;
}