"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { ReactFlow, Background, Controls, Edge, Node, BackgroundVariant, useNodesState } from '@xyflow/react';
import "@xyflow/react/dist/style.css";
import { useParams, useRouter } from 'next/navigation';
import { Database } from 'lucide-react';
import UserButton from '@/components/clerk-components/UserButton';
import CollectionNode from '@/components/nodes/CollectionNode';
import { Field } from '@/components/nodes/CollectionNode';
import axios from 'axios';
import { Diagram } from '@/lib/model/draw.model';
import { NodeType } from '@/components/nodes';

const nodeTypes = {
	collection: CollectionNode,
};

const TemplateView = () => {
	const params = useParams();
	const router = useRouter();
	const templateId = params.id as string;
	const [template, setTemplate] = useState<Diagram | null>(null);
	const [loading, setLoading] = useState(true);
	const [nodes, setNodes, onNodesChange] = useNodesState<NodeType>([]);
	const [localNodes, setLocalNodes] = useState<NodeType[]>([]);
	const [edges, setEdges] = useState<Edge[]>([]);



	useEffect(() => {
		const fetchTemplate = async () => {
			try {
				const response = await axios.get(`/api/templates/${templateId}`);
				setTemplate(response.data.diagram);
				setNodes(response.data.diagram.flow.nodes as NodeType[]);
				setEdges(response.data.diagram.flow.edges as Edge[]);
			} catch (error) {
				console.error('Error fetching template:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchTemplate();
	}, [templateId]);

	if (loading) {
		return (
			<div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
				<div className="text-white">Loading...</div>
			</div>
		);
	}

	if (!template) {
		return (
			<div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-white mb-4">Template not found</h2>
					<button
						onClick={() => router.push('/templates')}
						className="text-blue-500 hover:text-blue-400"
					>
						Back to Templates
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#0F1117]">
			<nav className="h-16 border-b border-white/10 flex items-center justify-between px-8">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<Database className="h-5 w-5 text-white" />
						<h1 className="text-white font-semibold">DB Draw</h1>
					</div>
					<div className="h-6 w-[1px] bg-white/10" />
					<div>
						<h2 className="text-white font-medium">{template.title}</h2>
						<p className="text-white/60 text-sm">{template.description}</p>
					</div>
				</div>
				<div className="flex items-center gap-4">
					<button
						onClick={() => router.push('/templates')}
						className="text-white/80 hover:text-white"
					>
						Back to Templates
					</button>
					<UserButton />
				</div>
			</nav>

			<main className="h-[calc(100vh-64px)]">
				<ReactFlow
					colorMode="dark"
					nodes={nodes}
					onNodesChange={onNodesChange}
					edges={edges}
					nodeTypes={nodeTypes}
					fitView
					minZoom={0.1}
					maxZoom={1.5}
					proOptions={{ hideAttribution: true,  }}
				>
					<Background
						style={{ backgroundColor: "#111315" }}
						color="#8c8c8c"
						size={2}
						gap={[50, 50]}
						variant={BackgroundVariant.Dots}
					/>
					<Controls orientation='horizontal' />
				</ReactFlow>
			</main>
		</div>
	);
};

export default TemplateView;