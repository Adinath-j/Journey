import React, { useEffect, useCallback } from 'react';
import { ReactFlow, Controls, Background, applyNodeChanges, applyEdgeChanges, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { useRoadmapStore } from '@/store/useRoadmapStore';
import CustomNode from './CustomNode';
import { PageContainer } from "@/components/layout/PageContainer";
import { Network } from "lucide-react";

const nodeTypes = { custom: CustomNode };

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 270;
  const nodeHeight = 90;

  dagreGraph.setGraph({ rankdir: direction, nodesep: 60, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
  });

  return { nodes, edges };
};

export default function KnowledgeGraph() {
  const { nodes: roadmapNodes, fetchRoadmap } = useRoadmapStore();
  const [nodes, setNodes] = React.useState([]);
  const [edges, setEdges] = React.useState([]);

  useEffect(() => {
    if (roadmapNodes.length === 0) fetchRoadmap();
  }, [fetchRoadmap, roadmapNodes.length]);

  useEffect(() => {
    if (roadmapNodes.length === 0) return;

    const initialNodes = roadmapNodes.map(node => ({
      id: node._id,
      type: 'custom',
      data: { 
        title: node.title, 
        status: node.status, 
        priorityScore: node.priorityScore 
      },
      position: { x: 0, y: 0 } // Dagre handles positioning
    }));

    const initialEdges = [];
    roadmapNodes.forEach(node => {
      if (node.dependencies && node.dependencies.length > 0) {
        node.dependencies.forEach(depId => {
          initialEdges.push({
            id: `e-${depId}-${node._id}`,
            source: depId,
            target: node._id,
            type: 'smoothstep',
            animated: node.status === 'active',
            style: { stroke: node.status === 'completed' ? '#10b981' : '#6366f1', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: node.status === 'completed' ? '#10b981' : '#6366f1',
            }
          });
        });
      }
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
      'TB' // Top to Bottom
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [roadmapNodes]);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  return (
    <PageContainer noScroll className="flex flex-col h-[calc(100vh-130px)] !p-0">
      <div className="p-7 pb-4 shrink-0 flex items-center justify-between border-b border-white/5 bg-[#0b1120] z-10 relative">
        <div className="flex items-center gap-4">
          <Network className="text-violet-400" />
          <div>
            <h1 className="text-xl font-bold text-white">Knowledge Graph</h1>
            <p className="text-sm text-slate-400">Your entire curriculum mapped by dependencies.</p>
          </div>
        </div>
      </div>
      <div className="flex-1 w-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={1.5}
          className="bg-[#0b1120]"
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#ffffff" gap={20} size={1} opacity={0.03} />
          <Controls className="bg-black/50 border border-white/10 fill-white rounded-lg overflow-hidden m-4" showInteractive={false} />
        </ReactFlow>
      </div>
    </PageContainer>
  );
}
