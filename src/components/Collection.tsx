"use client"

import { useState } from 'react';
import { NodeProps, Node } from '@xyflow/react';

export type CollectionNode = Node<
	{
		id: string;
		collection: {
			title: string
		};
		selected: string;
		tableWidth: number;
	},
	'collection'
>;

export default function CollectionNode(props: NodeProps<CollectionNode>) {
	const [title, setTitle] = useState(props.data.collection.title);

	return (
		<div className='bg-red-400 h-32 w-72'>
			<p>Count: {title}</p>
		</div>
	);
}