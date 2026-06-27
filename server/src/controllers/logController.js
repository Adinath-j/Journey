import { StudyLog } from "../models/StudyLog.js";
import { Roadmap } from "../models/Roadmap.js";

// @desc    Get all study logs for user
// @route   GET /api/logs
// @access  Private
export const getLogs = async (req, res) => {
  try {
    const logs = await StudyLog.find({ user: req.user._id }).sort({ date: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch logs", error: error.message });
  }
};

// @desc    Create a new study log
// @route   POST /api/logs
// @access  Private
export const createLog = async (req, res) => {
  try {
    const { 
      title, 
      durationMinutes, 
      topicId, 
      category, 
      notes, 
      completedTopic, 
      date,
      difficulty,
      confidence,
      problemsSolved,
      conceptsLearned,
      resources
    } = req.body;

    const log = await StudyLog.create({
      user: req.user._id,
      title,
      durationMinutes,
      topicId: topicId || null,
      category: category || "General",
      notes: notes || "",
      completedTopic: completedTopic || false,
      date: date ? new Date(date) : new Date(),
      difficulty: difficulty || undefined,
      confidence: confidence || undefined,
      problemsSolved: problemsSolved || [],
      conceptsLearned: conceptsLearned || [],
      resources: resources || [],
    });

    // If a topicId was provided and the user marked it as completed, update the Roadmap status!
    if (topicId && completedTopic) {
      await Roadmap.findOneAndUpdate(
        { _id: topicId, user: req.user._id },
        { status: "complete" }
      );
    } else if (topicId) {
      // If they logged time but didn't finish it, mark it as active
      await Roadmap.findOneAndUpdate(
        { _id: topicId, user: req.user._id, status: "upcoming" },
        { status: "active" }
      );
    }

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: "Failed to create log", error: error.message });
  }
};
