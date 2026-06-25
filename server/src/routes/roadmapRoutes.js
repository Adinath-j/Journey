import express from "express";
import { getRoadmap, createNode, updateNode, deleteNode } from "../controllers/roadmapController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.route("/")
  .get(protect, getRoadmap)
  .post(protect, createNode);

router.route("/:id")
  .put(protect, updateNode)
  .delete(protect, deleteNode);

export default router;
