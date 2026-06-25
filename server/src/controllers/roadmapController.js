import { Roadmap } from "../models/Roadmap.js";

// @desc    Get all roadmap nodes for the user
// @route   GET /api/roadmap
// @access  Private
export const getRoadmap = async (req, res) => {
  try {
    const nodes = await Roadmap.find({ user: req.user._id }).sort({ createdAt: 1 });
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch roadmap", error: error.message });
  }
};

// @desc    Create a new roadmap node
// @route   POST /api/roadmap
// @access  Private
export const createNode = async (req, res) => {
  try {
    const { title, description, parentId, status, estimatedHours } = req.body;

    // Validate parent if provided
    if (parentId) {
      const parent = await Roadmap.findOne({ _id: parentId, user: req.user._id });
      if (!parent) {
        return res.status(404).json({ message: "Parent node not found" });
      }
    }

    const node = await Roadmap.create({
      user: req.user._id,
      title,
      description,
      parentId: parentId || null,
      status: status || "upcoming",
      estimatedHours: estimatedHours || 0,
    });

    res.status(201).json(node);
  } catch (error) {
    res.status(500).json({ message: "Failed to create node", error: error.message });
  }
};

// @desc    Update a roadmap node
// @route   PUT /api/roadmap/:id
// @access  Private
export const updateNode = async (req, res) => {
  try {
    const { title, description, parentId, status, estimatedHours, notes } = req.body;

    const node = await Roadmap.findOne({ _id: req.params.id, user: req.user._id });
    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }

    // Optional: Add logic to prevent circular parent references if parentId changes

    node.title = title !== undefined ? title : node.title;
    node.description = description !== undefined ? description : node.description;
    node.parentId = parentId !== undefined ? parentId : node.parentId;
    node.status = status !== undefined ? status : node.status;
    node.estimatedHours = estimatedHours !== undefined ? estimatedHours : node.estimatedHours;
    node.notes = notes !== undefined ? notes : node.notes;

    const updatedNode = await node.save();
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
