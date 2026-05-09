// ==============================================
// Alert translation helpers
// Seed generates Arabic-only alerts; these functions
// produce English equivalents for bilingual responses.
// ==============================================

export function translateAlertTitle(title) {
  const map = {
    "تنبيه غياب": "Absence Warning",
    "إنذار غياب - خطر الحرمان": "Absence Alert — Denial Risk",
    "تنبيه درجات": "Grade Warning",
    "موعد الاختبارات النهائية": "Final Exams Schedule",
  };
  return map[title] || title;
}

/**
 * Translate alert body from Arabic to English.
 * @param {string} body - Arabic alert body
 * @param {Object} [courseMap] - Map of course code → English name (e.g. { CS201: "Data Structures" })
 */
export function translateAlertBody(body, courseMap) {
  if (!body) return body;

  // Helper: replace Arabic course name with English using the code in parentheses
  // e.g. "هياكل البيانات (CS201)" → "Data Structures (CS201)"
  const localizeCourse = (courseStr) => {
    if (!courseMap) return courseStr;
    const m = courseStr.match(/\(([A-Z]{2,5}\d{3,4})\)/);
    if (m && courseMap[m[1]]) return `${courseMap[m[1]]} (${m[1]})`;
    return courseStr;
  };

  return body
    .replace(/لديك (\d+) غيابات في مقرر (.+?)\. الحد الأقصى المسموح (\d+) غيابات\./,
      (_, count, course, max) => `You have ${count} absences in ${localizeCourse(course)}. Maximum allowed: ${max}.`)
    .replace(/تجاوزت الحد المسموح للغياب في مقرر (.+?)\. عدد الغيابات: (\d+)\. يرجى مراجعة شؤون الطلاب\./,
      (_, course, count) => `You exceeded the absence limit in ${localizeCourse(course)}. Absences: ${count}. Please contact Student Affairs.`)
    .replace(/درجتك في مقرر (.+?) أقل من الحد الأدنى للنجاح \((\d+)\/100\)\./,
      (_, course, score) => `Your grade in ${localizeCourse(course)} is below passing (${score}/100).`)
    .replace(/تبدأ الاختبارات النهائية يوم (.+?)\. يرجى مراجعة الجدول على البوابة الأكاديمية\./,
      (_, date) => `Final exams start on ${date}. Please check the schedule on the academic portal.`);
}
