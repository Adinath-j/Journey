import { StudyLog } from "../models/StudyLog.js";
import { Roadmap } from "../models/Roadmap.js";

// @desc    Get dashboard aggregated stats
// @route   GET /api/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Roadmap Progress
    const totalNodes = await Roadmap.countDocuments({ user: userId });
    const completedNodes = await Roadmap.countDocuments({ user: userId, status: "complete" });
    const overallProgress = totalNodes === 0 ? 0 : Math.round((completedNodes / totalNodes) * 100);

    // 2. Study Streak Calculation
    // Find unique dates of study logs
    const logs = await StudyLog.find({ user: userId }).select("date").sort({ date: -1 });
    let streak = 0;
    
    if (logs.length > 0) {
      const uniqueDates = [...new Set(logs.map(log => log.date.toISOString().split("T")[0]))];
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const todayStr = today.toISOString().split("T")[0];
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let currentDateStr = uniqueDates[0];
      let dateIndex = 0;

      if (currentDateStr === todayStr || currentDateStr === yesterdayStr) {
        streak = 1;
        let checkDate = new Date(currentDateStr);
        
        while (dateIndex < uniqueDates.length - 1) {
          checkDate.setDate(checkDate.getDate() - 1);
          const previousStr = checkDate.toISOString().split("T")[0];
          
          if (uniqueDates[dateIndex + 1] === previousStr) {
            streak++;
            dateIndex++;
          } else {
            break;
          }
        }
      }
    }

    // 3. Hours This Week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weekLogs = await StudyLog.aggregate([
      { $match: { user: userId, date: { $gte: oneWeekAgo } } },
      { $group: { _id: null, totalMinutes: { $sum: "$durationMinutes" } } }
    ]);
    
    const hoursThisWeek = weekLogs.length > 0 ? (weekLogs[0].totalMinutes / 60).toFixed(1) : "0.0";

    // 4. Total Study Hours (All Time)
    const allTimeLogs = await StudyLog.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, totalMinutes: { $sum: "$durationMinutes" } } }
    ]);
    
    const totalHours = allTimeLogs.length > 0 ? (allTimeLogs[0].totalMinutes / 60).toFixed(1) : "0.0";

    // 5. Heatmap Generation (Last 3 months approx)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const heatmapLogs = await StudyLog.aggregate([
      { $match: { user: userId, date: { $gte: threeMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalMinutes: { $sum: "$durationMinutes" }
        }
      }
    ]);

    // Map heatmap dates to values (0-4 intensity)
    const heatmapData = heatmapLogs.map(log => ({
      date: log._id,
      intensity: Math.min(4, Math.ceil(log.totalMinutes / 30)) // e.g. 1 unit = 30 mins, max 4
    }));

    // 6. Dynamic Focus Items & Mission Items
    const allRoadmapNodes = await Roadmap.find({ user: userId });
    
    // Calculate progress for root nodes to use as "Current Focus"
    const rootNodes = allRoadmapNodes.filter(n => !n.parentId);
    const getDescendants = (nodeId) => {
      let descendants = [];
      const children = allRoadmapNodes.filter(n => n.parentId?.toString() === nodeId.toString());
      descendants.push(...children);
      for (let child of children) {
        descendants.push(...getDescendants(child._id));
      }
      return descendants;
    };

    const accents = ["violet", "blue", "mint", "orange", "rose"];
    const focusItems = rootNodes.map((root, index) => {
      const descendants = getDescendants(root._id);
      const total = descendants.length + 1;
      const completed = (root.status === "complete" ? 1 : 0) + descendants.filter(d => d.status === "complete").length;
      const progress = Math.round((completed / total) * 100);
      return { 
        label: root.title, 
        progress, 
        accent: accents[index % accents.length] 
      };
    }).sort((a, b) => b.progress - a.progress).slice(0, 3); // Top 3

    // Find "active" tasks for Today's Mission
    const activeNodes = allRoadmapNodes.filter(n => n.status === "active").slice(0, 5);
    const missionItems = activeNodes.map(n => ({
      id: n._id,
      label: n.title,
      duration: `${n.estimatedHours || 1}h`,
      completed: false
    }));

    // If no active nodes, let's grab some upcoming ones
    if (missionItems.length === 0) {
      const upcomingNodes = allRoadmapNodes.filter(n => n.status === "upcoming").slice(0, 3);
      missionItems.push(...upcomingNodes.map(n => ({
        id: n._id,
        label: n.title,
        duration: `${n.estimatedHours || 1}h`,
        completed: false
      })));
    }

    res.json({
      overview: {
        userName: req.user.name,
        greeting: "Welcome back",
        subtitle: "Small progress today, big results tomorrow.",
        overallProgress,
        estimatedTime: "N/A", // Could be derived from roadmap
      },
      metrics: [
        { id: "progress", label: "Overall Progress", value: `${overallProgress}%`, suffix: "", accent: "violet" },
        { id: "streak", label: "Study Streak", value: streak.toString(), suffix: "days", accent: "orange" },
        { id: "hours", label: "Hours This Week", value: hoursThisWeek.toString(), suffix: "hours", accent: "blue" },
        { id: "projects", label: "Projects Completed", value: completedNodes.toString(), suffix: "projects", accent: "mint" },
      ],
      quickStats: [
        { label: "Total Study Hours", value: totalHours.toString() },
        { label: "Topics Completed", value: completedNodes.toString() },
      ],
      focusItems,
      missionItems,
      heatmap: heatmapData,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard stats", error: error.message });
  }
};
