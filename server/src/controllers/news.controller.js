// ==============================================
// SARA — News Controller
// ==============================================

import { getNews } from "../services/news.service.js";

/** GET /api/news */
export async function handleGetNews(req, res, next) {
  try {
    const category = req.query.category || null;
    const news = await getNews(category);
    res.json({ news });
  } catch (err) {
    next(err);
  }
}
