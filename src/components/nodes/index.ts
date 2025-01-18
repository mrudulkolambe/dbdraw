import type { Node, NodeTypes } from '@xyflow/react';
import CollectionNode, { type CollectionNodeType } from './CollectionNode';
import NotesNode, { type NotesNodeType } from './NotesNode';

export const initialNodes: (CollectionNodeType | NotesNodeType)[] = [] satisfies Node[];

export const nodeTypes = {
  'collection': CollectionNode,
  'note': NotesNode,
} satisfies NodeTypes;

export type NodeType = CollectionNodeType | NotesNodeType;
