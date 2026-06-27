import express from "express";
import { getRoadmap, createNode, updateNode, deleteNode, reorderNodes, importRoadmap } from "../controllers/roadmapController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.put("/reorder", protect, reorderNodes);
router.post("/import", protect, importRoadmap);

router.route("/")
  .get(protect, getRoadmap)
  .post(protect, createNode);

router.route("/:id")
  .put(protect, updateNode)
  .delete(protect, deleteNode);

export default router;
