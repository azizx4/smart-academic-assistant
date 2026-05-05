// ==============================================
// SARA — Faculty Routes
// GET /api/faculty/* — faculty only
// ==============================================

import { Router } from "express";
import {
  handleGetFacultyCourses,
  handleGetCourseStudents,
  handleGetExcessiveAbsences,
} from "../controllers/faculty.controller.js";
import { roleGuard } from "../middleware/index.js";

const router = Router();

// Faculty's courses list
router.get("/courses", roleGuard("faculty"), handleGetFacultyCourses);

// Students in a specific course
router.get("/courses/:courseCode/students", roleGuard("faculty"), handleGetCourseStudents);

// Students exceeding absence limit
router.get("/absences/excessive", roleGuard("faculty"), handleGetExcessiveAbsences);

export default router;
