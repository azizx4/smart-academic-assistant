// ==============================================
// SARA — News Tool
// University news — visible to every authenticated role.
// ==============================================

import { getNews } from "../services/news.service.js";

export const getNewsTool = {
  name: "get_news",
  description:
    "Returns university news items (public to all users), newest first. Supports optional category filter: 'news', 'competition', 'announcement'. Call this for ANY question about campus news, announcements, events, competitions, or general university updates. Example phrasings: 'الأخبار', 'آخر الأخبار', 'وش الجديد', 'فيه إعلانات', 'مسابقات الجامعة', 'اخبار الجامعة', 'news', 'announcements', 'campus events'.",
  roles: ["student", "faculty"],
  parameters: {
    type: "object",
    properties: {
      category: {
        type: "string",
        description:
          "Optional: 'news' | 'competition' | 'announcement'. Omit for all categories.",
      },
    },
    required: [],
  },
  handler: async (args) => {
    return await getNews(args?.category || null);
  },
};
