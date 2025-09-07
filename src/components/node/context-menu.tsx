import React from 'react'
import type { HTMLAttributes } from 'react'
import { CollectionNodeType } from '.'

interface CollectionNodeContextMenuProps extends HTMLAttributes<HTMLDivElement> {
	collection: CollectionNodeType;
	top?: number | boolean;
	left?: number | boolean;
	right?: number | boolean;
	bottom?: number | boolean;
	deleteTable: (collectionID: string) => void;
}

const CollectionNodeContextMenu = ({
	collection,
	top,
	left,
	right,
	bottom,
	deleteTable,
	...props
}: CollectionNodeContextMenuProps) => {
	// Filter out boolean values from positioning to avoid invalid CSS
	const style = {
		top: typeof top === 'number' ? top : undefined,
		left: typeof left === 'number' ? left : undefined,
		right: typeof right === 'number' ? right : undefined,
		bottom: typeof bottom === 'number' ? bottom : undefined,
	}

	return (
		<div
			{...props}
			className='absolute z-50 bg-[#1c1c1c] px-3 py-3 rounded-md w-44'
			style={style}>
			<div className='hover:bg-white/5 duration-150 cursor-pointer px-2 py-2 text-sm font-semibold rounded-md text-white'>Rename</div>
			<div className='hover:bg-white/5 duration-150 cursor-pointer px-2 py-2 text-sm font-semibold rounded-md text-white'>Duplicate</div>
			<div className='hover:bg-white/5 duration-150 cursor-pointer px-2 py-2 text-sm font-semibold rounded-md text-white' onClick={() => deleteTable(collection.id)}>Delete</div>
		</div>
	)
}

export default CollectionNodeContextMenu
