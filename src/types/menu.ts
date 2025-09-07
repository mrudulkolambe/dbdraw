import { CollectionNodeType } from "@/components/node"

export type ContextMenuType = {
	collection: CollectionNodeType,
	top: number | boolean,
	left: number | boolean,
	right: number | boolean,
	bottom: number | boolean,
}