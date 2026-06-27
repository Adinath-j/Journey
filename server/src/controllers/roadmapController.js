import { Roadmap } from "../models/Roadmap.js";

// @desc    Get all roadmap nodes for the user
// @route   GET /api/roadmap
// @access  Private
export const getRoadmap = async (req, res) => {
  try {
    const nodes = await Roadmap.find({ user: req.user._id }).sort({ order: 1, createdAt: 1 });
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch roadmap", error: error.message });
  }
};

// @desc    Create a new roadmap node
// @route   POST /api/roadmap
// @access  Private
// @desc    Create a new roadmap node
// @route   POST /api/roadmap
// @access  Private
export const createNode = async (req, res) => {
  try {
    const { title, description, parentId, status, estimatedHours, order, importance, frequency } = req.body;

    // Validate parent if provided
    if (parentId) {
      const parent = await Roadmap.findOne({ _id: parentId, user: req.user._id });
      if (!parent) {
        return res.status(404).json({ message: "Parent node not found" });
      }
    }

    // Default to putting new nodes at the bottom of their sibling list
    let finalOrder = order;
    if (finalOrder === undefined) {
      const siblings = await Roadmap.find({ parentId: parentId || null, user: req.user._id }).sort({ order: -1 }).limit(1);
      finalOrder = siblings.length > 0 ? siblings[0].order + 1024 : 1024;
    }

    const node = await Roadmap.create({
      user: req.user._id,
      title,
      description,
      parentId: parentId || null,
      status: status || "upcoming",
      estimatedHours: estimatedHours || 0,
      order: finalOrder,
      importance: importance || 5,
      frequency: frequency || "none",
    });

    res.status(201).json(node);
  } catch (error) {
    res.status(500).json({ message: "Failed to create node", error: error.message });
  }
};

const checkAndCompleteNode = async (nodeId, userId) => {
  const node = await Roadmap.findOne({ _id: nodeId, user: userId });
  if (!node || node.status === "complete") return;

  // Check concepts
  const allConceptsCompleted = node.concepts?.every(c => c.completed) ?? true;
  const allProblemsCompleted = node.problems?.every(p => p.completed) ?? true;

  // Check children
  const children = await Roadmap.find({ parentId: node._id, user: userId });
  const allChildrenCompleted = children.length === 0 || children.every(c => c.status === "complete");

  // Only auto-complete if there is actually something to complete, to prevent empty nodes from auto-completing incorrectly, 
  // but if it's a leaf node that had items and they are done, complete it.
  const hasItems = (node.concepts?.length > 0) || (node.problems?.length > 0) || (children.length > 0);
  
  if (hasItems && allConceptsCompleted && allProblemsCompleted && allChildrenCompleted) {
    node.status = "complete";
    await node.save();
    if (node.parentId) {
      await checkAndCompleteNode(node.parentId, userId);
    }
  }
};

// @desc    Update a roadmap node
// @route   PUT /api/roadmap/:id
// @access  Private
// @desc    Update a roadmap node
// @route   PUT /api/roadmap/:id
// @access  Private
export const updateNode = async (req, res) => {
  try {
    const { title, description, parentId, status, estimatedHours, notes, concepts, problems, order, dependencies, importance, frequency } = req.body;

    const node = await Roadmap.findOne({ _id: req.params.id, user: req.user._id });
    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }

    node.title = title !== undefined ? title : node.title;
    node.description = description !== undefined ? description : node.description;
    node.parentId = parentId !== undefined ? parentId : node.parentId;
    node.status = status !== undefined ? status : node.status;
    node.estimatedHours = estimatedHours !== undefined ? estimatedHours : node.estimatedHours;
    node.notes = notes !== undefined ? notes : node.notes;
    node.order = order !== undefined ? order : node.order;
    node.dependencies = dependencies !== undefined ? dependencies : node.dependencies;
    node.importance = importance !== undefined ? importance : node.importance;
    node.frequency = frequency !== undefined ? frequency : node.frequency;
    
    // Checklist Sync
    if (concepts !== undefined) node.concepts = concepts;
    if (problems !== undefined) node.problems = problems;

    const updatedNode = await node.save();

    // Check if this update triggers an auto-completion chain upwards
    await checkAndCompleteNode(updatedNode._id, req.user._id);
    if (updatedNode.parentId && updatedNode.status === "complete") {
       await checkAndCompleteNode(updatedNode.parentId, req.user._id);
    }

    res.json(updatedNode);
  } catch (error) {
    res.status(500).json({ message: "Failed to update node", error: error.message });
  }
};

// @desc    Delete a node and all its descendants
// @route   DELETE /api/roadmap/:id
// @access  Private
export const deleteNode = async (req, res) => {
  try {
    const rootId = req.params.id;
    const node = await Roadmap.findOne({ _id: rootId, user: req.user._id });
    
    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }

    // Helper to recursively find all descendants
    const findDescendants = async (parentId) => {
      const children = await Roadmap.find({ parentId, user: req.user._id });
      let ids = children.map(c => c._id);
      for (let child of children) {
        const descendantIds = await findDescendants(child._id);
        ids = ids.concat(descendantIds);
      }
      return ids;
    };

    const idsToDelete = await findDescendants(rootId);
    idsToDelete.push(rootId); // Include the target node itself

    await Roadmap.deleteMany({ _id: { $in: idsToDelete }, user: req.user._id });

    res.json({ message: "Node and descendants removed", deletedIds: idsToDelete });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete node", error: error.message });
  }
};

// @desc    Bulk update order and parentIds
// @route   PUT /api/roadmap/reorder
// @access  Private
export const reorderNodes = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { _id, parentId, order }
    
    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ message: "Updates array required" });
    }

    // Prepare bulk write operations
    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { _id: update._id, user: req.user._id },
        update: { $set: { parentId: update.parentId || null, order: update.order } }
      }
    }));

    if (bulkOps.length > 0) {
      await Roadmap.bulkWrite(bulkOps);
    }

    res.json({ message: "Reorder successful" });
  } catch (error) {
    res.status(500).json({ message: "Failed to reorder nodes", error: error.message });
  }
};

// @desc    Import JSON roadmap structure
// @route   POST /api/roadmap/import
// @access  Private
export const importRoadmap = async (req, res) => {
  try {
    const { nodes } = req.body; // Array of nested node objects
    if (!nodes || !Array.isArray(nodes)) {
      return res.status(400).json({ message: "Valid nodes array required" });
    }

    const importedIds = [];

    // Recursive helper to insert nodes
    const insertNodes = async (items, parentId = null) => {
      let currentOrder = 1024;
      for (const item of items) {
        const node = await Roadmap.create({
          user: req.user._id,
          title: item.title,
          description: item.description || "",
          parentId,
          status: item.status || "upcoming",
          estimatedHours: item.estimatedHours || 0,
          order: currentOrder,
          concepts: item.concepts || [],
          problems: item.problems || [],
          resources: item.resources || [],
          notes: item.notes || ""
        });
        
        importedIds.push(node._id);
        currentOrder += 1024;

        if (item.children && Array.isArray(item.children) && item.children.length > 0) {
          await insertNodes(item.children, node._id);
        }
      }
    };

    await insertNodes(nodes);
    res.status(201).json({ message: "Import successful", count: importedIds.length });
  } catch (error) {
    res.status(500).json({ message: "Failed to import roadmap", error: error.message });
  }
};
