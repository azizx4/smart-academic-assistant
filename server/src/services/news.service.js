// ==============================================
// SARA — News Service
// University news — accessible by all roles
// ==============================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Get all news items.
 * No scope filter — news is public to all authenticated users.
 *
 * @param {string} category - Optional filter: "news" | "competition" | "announcement"
 */
export async function getNews(category = null) {
  const where = category ? { category } : {};

  const news = await prisma.news.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      titleAr: true,
      titleEn: true,
      bodyAr: true,
      bodyEn: true,
      category: true,
      publishedAt: true,
    },
  });

  return news;
}
