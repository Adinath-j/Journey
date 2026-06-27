import { StudyLog } from "../models/StudyLog.js";
import { Roadmap } from "../models/Roadmap.js";
import mongoose from "mongoose";

// @desc    Get dashboard aggregated stats
// @route   GET /api/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // We use Promise.all to run these highly optimized MongoDB pipelines in parallel
    const [
      heroResult,
      weeklyLogsResult,
      weeklyTopicsResult,
      todaysPlanResult,
      heatmapResult,
      recentActivityResult
    ] = await Promise.all([
      // 1. Hero & Breadcrumbs Pipeline
      Roadmap.aggregate([
        { $match: { user: userId, status: "active" } },
        { $limit: 1 },
        {
          $graphLookup: {
            from: "roadmaps",
            startWith: "$parentId",
            connectFromField: "parentId",
            connectToField: "_id",
            as: "ancestors",
            depthField: "depth"
          }
        },
        {
          $lookup: {
            from: "roadmaps",
            localField: "_id",
            foreignField: "parentId",
            as: "children"
          }
        },
        {
          $lookup: {
            from: "studylogs",
            let: { topicId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$topicId", "$$topicId"] } } },
              { $sort: { date: -1 } },
              { $limit: 1 }
            ],
            as: "latestLog"
          }
        }
      ]),

      // 2. Weekly Progress Pipeline
      StudyLog.aggregate([
        { $match: { user: userId, date: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) } } },
        { $group: { _id: null, totalMinutes: { $sum: "$durationMinutes" } } }
      ]),

      Roadmap.aggregate([
        { $match: { user: userId, status: "complete", updatedAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) } } },
        { $count: "count" }
      ]),

      // 3. Today's Plan: Intelligent Scoring Engine Pipeline
      Roadmap.aggregate([
        { $match: { user: userId, status: { $ne: "complete" } } },
        // Lookup incomplete dependencies
        {
          $lookup: {
            from: "roadmaps",
            localField: "dependencies",
            foreignField: "_id",
            pipeline: [ { $match: { status: { $ne: "complete" } } } ],
            as: "incompleteDeps"
          }
        },
        // Only keep nodes with NO incomplete dependencies
        { $match: { incompleteDeps: { $size: 0 } } },
        // Lookup latest study log for this node
        {
          $lookup: {
            from: "studylogs",
            let: { topicId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$topicId", "$$topicId"] } } },
              { $sort: { date: -1 } },
              { $limit: 1 }
            ],
            as: "latestLog"
          }
        },
        // Calculate scoring fields natively in Mongo
        {
          $addFields: {
            baseScore: { $ifNull: ["$importance", 5] },
            freqBonus: {
              $cond: { if: { $eq: ["$frequency", "daily"] }, then: 5, else: { $cond: { if: { $eq: ["$frequency", "weekly"] }, then: 3, else: 0 } } }
            },
            latestDate: { $arrayElemAt: ["$latestLog.date", 0] },
            isUpcoming: { $eq: ["$status", "upcoming"] }
          }
        },
        {
          $addFields: {
            daysSince: {
              $cond: {
                if: { $ne: ["$latestDate", null] },
                then: { $floor: { $divide: [ { $subtract: [new Date(), "$latestDate"] }, 1000 * 3600 * 24 ] } },
                else: 0
              }
            }
          }
        },
        {
          $addFields: {
            daysBonus: { $min: ["$daysSince", 14] },
            newTopicBonus: { $cond: { if: "$isUpcoming", then: 5, else: 0 } }
          }
        },
        {
          $addFields: {
            priorityScore: { $add: ["$baseScore", "$freqBonus", "$daysBonus", "$newTopicBonus"] },
            reason: {
              $cond: {
                if: { $gte: ["$daysSince", 3] }, then: "Revision Due",
                else: {
                  $cond: {
                    if: "$isUpcoming", then: "Start New Topic",
                    else: {
                      $cond: {
                        if: { $eq: ["$frequency", "daily"] }, then: "Daily Focus",
                        else: {
                          $cond: {
                            if: { $gte: ["$baseScore", 8] }, then: "High Importance",
                            else: "Recommended"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        { $sort: { priorityScore: -1 } },
        { $limit: 4 },
        {
          $project: {
            id: "$_id",
            title: 1,
            duration: { $concat: [{ $toString: { $ifNull: ["$estimatedHours", 1] } }, "h"] },
            subtitle: { $cond: { if: { $gt: [{ $size: { $ifNull: ["$problems", []] } }, 0] }, then: { $concat: [{ $toString: { $size: "$problems" } }, " Problems"] }, else: null } },
            priorityScore: 1,
            reason: 1
          }
        }
      ]),

      // 4. Heatmap & Timeline Pipeline
      StudyLog.aggregate([
        { $match: { user: userId, date: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } } },
        {
          $lookup: {
            from: "roadmaps",
            localField: "topicId",
            foreignField: "_id",
            as: "topicDetails"
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            totalMinutes: { $sum: "$durationMinutes" },
            topics: { $addToSet: { $arrayElemAt: ["$topicDetails.title", 0] } },
            problems: { $push: "$problemsSolved" },
            concepts: { $push: "$conceptsLearned" },
            resources: { $push: "$resources" },
            notes: { $push: "$notes" },
            logs: { 
              $push: {
                id: "$_id",
                title: "$title",
                topicId: "$topicId",
                details: { $concatArrays: [ { $ifNull: ["$problemsSolved", []] }, { $ifNull: ["$conceptsLearned", []] } ] }
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // 5. Recent Activity
      StudyLog.find({ user: userId }).sort({ date: -1 }).limit(10).select("_id title date")
    ]);

    // Format Hero Response
    let hero = null;
    let currentTopic = null;
    let remainingTopics = [];

    if (heroResult.length > 0) {
      const activeNode = heroResult[0];
      currentTopic = activeNode;
      
      const breadcrumb = activeNode.ancestors
        .sort((a, b) => b.depth - a.depth) // Root to current
        .map(a => a.title);

      const totalItems = (activeNode.concepts?.length || 0) + (activeNode.problems?.length || 0) + activeNode.children.length;
      let completedItems = activeNode.children.filter(c => c.status === "complete").length;
      completedItems += (activeNode.concepts || []).filter(c => c.completed).length;
      completedItems += (activeNode.problems || []).filter(p => p.completed).length;
      const progress = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

      hero = {
        nodeId: activeNode._id,
        title: activeNode.title,
        breadcrumb,
        progress,
        estimatedRemaining: `${activeNode.estimatedHours || 1}h 00m`,
        lastStudied: activeNode.latestLog.length > 0 ? activeNode.latestLog[0].date : null,
      };

      // Fetch remaining topics based on hero's parent
      remainingTopics = await Roadmap.find({
        user: userId,
        parentId: activeNode.parentId || activeNode._id,
        _id: { $ne: activeNode._id },
        status: { $ne: "complete" }
      }).limit(4).select("_id title estimatedHours");
    }

    // Format Weekly Progress
    const hoursStudied = weeklyLogsResult.length > 0 ? (weeklyLogsResult[0].totalMinutes / 60).toFixed(1) : "0.0";
    const topicsCompleted = weeklyTopicsResult.length > 0 ? weeklyTopicsResult[0].count : 0;
    const weeklyProgress = {
      hoursStudied,
      goalHours: 15,
      topicsCompleted,
      goalTopics: 8
    };

    // Format Heatmap & Timeline Response
    const timeline = [];
    const heatmap = heatmapResult.map(day => {
      // Flatten arrays since we pushed arrays of arrays in grouping
      const flatProblems = day.problems.flat().filter(Boolean);
      const flatConcepts = day.concepts.flat().filter(Boolean);
      const flatResources = day.resources.flat().filter(Boolean);
      const flatNotes = day.notes.flat().filter(Boolean);

      timeline.push({
        date: day._id,
        items: day.logs.map(log => ({
          id: log.id,
          title: log.title,
          topicId: log.topicId,
          details: log.details.flat().filter(Boolean).join(", ")
        }))
      });

      return {
        date: day._id,
        totalMinutes: day.totalMinutes,
        intensity: Math.min(4, Math.ceil(day.totalMinutes / 30)),
        topics: day.topics.filter(Boolean),
        problems: flatProblems,
        concepts: flatConcepts,
        resources: flatResources,
        notes: flatNotes
      };
    });

    res.json({
      userName: req.user.name,
      hero,
      weeklyProgress,
      todaysPlan: todaysPlanResult,
      currentTopic,
      remainingTopics: remainingTopics.map(n => ({ id: n._id, title: n.title, progress: 0, duration: `${n.estimatedHours || 1}h` })),
      recentActivity: recentActivityResult.map(l => ({ id: l._id, title: l.title, date: l.date })),
      timeline: timeline.reverse(), // Newest first for timeline view
      heatmap
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard workspace", error: error.message });
  }
};
