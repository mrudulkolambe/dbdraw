"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { ReactFlow, Background, Controls, Edge, Node, BackgroundVariant, useNodesState } from '@xyflow/react';
import "@xyflow/react/dist/style.css";
import { useParams, useRouter } from 'next/navigation';
import { Database, Loader2 } from 'lucide-react';
import UserButton from '@/components/clerk-components/UserButton';
import CollectionNode from '@/components/nodes/CollectionNode';
import { Field } from '@/components/nodes/CollectionNode';
import axios from 'axios';
import { Diagram } from '@/lib/model/draw.model';
import { NodeType } from '@/components/nodes';
import { toast } from 'sonner';

const nodeTypes = {
	collection: CollectionNode,
};

const DiagramView = () => {
	const params = useParams();
	const router = useRouter();
	const templateId = params.id as string;
	const [template, setTemplate] = useState<Diagram | null>(null);
	const [loading, setLoading] = useState(true);
	const [cloning, setCloning] = useState(false);
	const [nodes, setNodes, onNodesChange] = useNodesState<NodeType>([]);
	const [edges, setEdges] = useState<Edge[]>([]);

	const cloneTemplate = async () => {
		if (!template || cloning) return;
		
		try {
			setCloning(true);
			
			// Validate required fields
			if (!template.title) {
				throw new Error('Diagram title is required');
			}
			
			if (!template.flow || !template.flow.nodes || !template.flow.edges) {
				throw new Error('Diagram flow data is invalid');
			}
			
			const response = await axios.post('/api/diagram', {
				title: `${template.title} (Clone)`,
				description: template.description,
				tag: template.tag?._id,
				flow: template.flow,
				icon: template.icon
			});
			
			if (!response.data?._id) {
				throw new Error('Failed to get ID of cloned diagram');
			}
			
			router.push(`/board/${response.data._id}`);
		} catch (error: any) {
			console.error('Error cloning diagram:', error);
		
			let message = 'Failed to clone diagram';
			
			if (error.response?.status === 401) {
				message = 'Please sign in to clone diagram';
			} else if (error.response?.status === 404) {
				message = 'Diagram not found';
			} else if (error.response?.data?.message) {
				message = error.response.data.message;
			} else if (error.message) {
				message = error.message;
			}
			toast.info(message);
		}
	};



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

	if (loading || cloning) {
		return (
			<div className="min-h-screen bg-[#0F1117] flex items-center justify-center gap-2">
				<Loader2 className="h-5 w-5 text-white animate-spin" />
				<div className="text-white">{loading ? 'Loading...' : 'Cloning diagram...'}</div>
			</div>
		);
	}

	if (!template) {
		return (
			<div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-white mb-4">Diagram not found</h2>
					<button
						onClick={() => router.push('/')}
						className="text-blue-500 hover:text-blue-400"
					>
						Back to Home
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
				<div className="flex items-center gap-6">
					<button
						onClick={cloneTemplate}
						className="text-blue-500 hover:text-blue-400 underline text-sm font-medium"
					>
						Clone Diagram
					</button>
					<button
						onClick={() => router.push('/board')}
						className="text-white/80 hover:text-white text-sm"
					>
						Back to Home
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

export default DiagramView;