"use client";

import React, { useCallback } from 'react';
import { ReactFlow, Background, Controls, Edge, Node, BackgroundVariant } from '@xyflow/react';
import "@xyflow/react/dist/style.css";
import { useParams, useRouter } from 'next/navigation';
import { Database } from 'lucide-react';
import UserButton from '@/components/clerk-components/UserButton';
import CollectionNode from '@/components/nodes/CollectionNode';
import { Field } from '@/components/nodes/CollectionNode';

const nodeTypes = {
	collection: CollectionNode,
};

// Template data - this would come from your templates store/API
const templateData = {
	ecommerce: {
		title: 'E-commerce Platform',
		nodes: [
			{
				id: 'products',
				type: 'collection',
				position: { x: 100, y: 100 },
				data: {
					label: 'Products',
					fields: [
						{ id: '1', name: 'name', type: 'string', required: true, unique: false, list: false } as Field,
						{ id: '2', name: 'price', type: 'number', required: true, unique: false, list: false } as Field,
						{ id: '3', name: 'description', type: 'string', required: false, unique: false, list: false } as Field,
						{ id: '4', name: 'category', type: 'ref', required: true, unique: false, list: false, ref: 'Categories' } as Field,
					],
					onClick: () => { },
					onFieldDelete: () => { },
					onDuplicate: () => { },
					onRename: () => { },
					onDelete: () => { },
					addNote: () => { },
					tableWidth: 280
				}
			},
			{
				id: 'categories',
				type: 'collection',
				position: { x: 500, y: 100 },
				data: {
					label: 'Categories',
					fields: [
						{ id: '1', name: 'name', type: 'string', required: true, unique: true, list: false } as Field,
						{ id: '2', name: 'slug', type: 'string', required: true, unique: true, list: false } as Field,
					],
					onClick: () => { },
					onFieldDelete: () => { },
					onDuplicate: () => { },
					onRename: () => { },
					onDelete: () => { },
					addNote: () => { },
					tableWidth: 280
				}
			},
			{
				id: 'orders',
				type: 'collection',
				position: { x: 100, y: 400 },
				data: {
					label: 'Orders',
					fields: [
						{ id: '1', name: 'orderNumber', type: 'string', required: true, unique: true, list: false } as Field,
						{ id: '2', name: 'customer', type: 'ref', required: true, unique: false, list: false, ref: 'Customers' } as Field,
						{ id: '3', name: 'products', type: 'ref', required: true, unique: false, list: true, ref: 'Products' } as Field,
						{ id: '4', name: 'totalAmount', type: 'number', required: true, unique: false, list: false } as Field,
						{ id: '5', name: 'status', type: 'string', required: true, unique: false, list: false } as Field,
					],
					onClick: () => { },
					onFieldDelete: () => { },
					onDuplicate: () => { },
					onRename: () => { },
					onDelete: () => { },
					addNote: () => { },
					tableWidth: 280
				}
			},
			{
				id: 'customers',
				type: 'collection',
				position: { x: 500, y: 400 },
				data: {
					label: 'Customers',
					fields: [
						{ id: '1', name: 'email', type: 'string', required: true, unique: true, list: false } as Field,
						{ id: '2', name: 'name', type: 'string', required: true, unique: false, list: false } as Field,
						{ id: '3', name: 'address', type: 'string', required: false, unique: false, list: false } as Field,
					],
					onClick: () => { },
					onFieldDelete: () => { },
					onDuplicate: () => { },
					onRename: () => { },
					onDelete: () => { },
					addNote: () => { },
					tableWidth: 280
				}
			},
		],
		edges: [
			{
				id: 'e1',
				source: 'products',
				target: 'categories',
				sourceHandle: 'target-3',
				targetHandle: 'source',
				type: 'smoothstep',
				animated: true,
			},
			{
				id: 'e2',
				source: 'orders',
				target: 'products',
				sourceHandle: 'target-2',
				targetHandle: 'source',
				type: 'smoothstep',
				animated: true,
			},
			{
				id: 'e3',
				source: 'orders',
				target: 'customers',
				sourceHandle: 'target-1',
				targetHandle: 'source',
				type: 'smoothstep',
				animated: true,
			},
		]
	},
	// Add more templates here
};

const TemplateView = () => {
	const params = useParams();
	const router = useRouter();
	const templateId = params.id as string;

	const template = templateData[templateId as keyof typeof templateData];

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
				<div className="flex items-center gap-2">
					<Database className="h-5 w-5 text-white" />
					<h1 className="text-white font-semibold">DB Draw</h1>
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
					nodes={template.nodes}
					edges={template.edges}
					nodeTypes={nodeTypes}
					fitView
					minZoom={0.1}
					maxZoom={1.5}
					proOptions={{ hideAttribution: true }}
				>
					<Background
						style={{ backgroundColor: "#111315" }}
						color="#8c8c8c"
						size={2}
						gap={[50, 50]}
						variant={BackgroundVariant.Dots}
					/>
					<Controls />
				</ReactFlow>
			</main>
		</div>
	);
};

export default TemplateView;