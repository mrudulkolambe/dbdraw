"use client"

import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "../ui/node-context-menu";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

export type NotesData = {
  label: string;
  description: string,
  onClick: (id: string) => void;
  onEdit: (title: string, description: string, noteId?: string) => void;
  onDuplicate: (node: NotesData) => void;
  onDelete: (id: string) => void;
};

export type NotesNodeType = Node<NotesData>;

export default function NotesNode({
  id,
  data,
}: NodeProps<NotesNodeType>) {
  const notesRef = useRef<HTMLDivElement | null>(null);
  const [showNote, setShowNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState(data.label);
  const [noteDescription, setNoteDescription] = useState(data.description)
  return (
    <>
      <Dialog open={showNote} onOpenChange={(e) => setShowNote(e)}>
        <DialogContent className="text-white min-w-[40vw] border-white/30">
          <DialogTitle>Add Note</DialogTitle>
          <div className="flex flex-col gap-3">
            <input onChange={(e) => setNoteTitle(e.target.value)} value={noteTitle} type="text" className="input w-full" placeholder="Enter note title here..." />
            <textarea onChange={(e) => setNoteDescription(e.target.value)} value={noteDescription} className="input w-full h-40 resize-none" placeholder="Enter note content here..."></textarea>
            <button onClick={() => {
              console.log("NOTE ID", id)
              data.onEdit(noteTitle, noteDescription, id);
              setShowNote(false)
            }} className="button bg-blue-600">Update</button>
          </div>
        </DialogContent>
      </Dialog>


      <ContextMenu>
        <ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => setShowNote(true)} className="hover:bg-white/10 px-3 py-2">Edit</ContextMenuItem>
            <ContextMenuItem onClick={() => data.onDuplicate(data)} className="hover:bg-white/10 px-3 py-2">Duplicate</ContextMenuItem>
            <ContextMenuItem onClick={() => data.onDelete(id)} className="hover:bg-white/10 px-3 py-2">Delete</ContextMenuItem>
          </ContextMenuContent>

          <div className="back-ground" ref={notesRef}
            onClick={() => {
              data.onClick(id)
            }}>
            <div className="note">
              <Handle
                type="source"
                position={Position.Bottom}
                id={`source-${id}`}
                style={{ background: "#555", height: "10px", width: "10px", cursor: "cell" }}
                isConnectable={true}
              />
              <h3 className="text-base font-semibold py-2 px-3">
                {data.label}
              </h3>
              <div className="relative text-xs px-3 py-2 bg-black/20">
                {data.description}
              </div>
            </div>
          </div>
        </ContextMenuTrigger>
      </ContextMenu>
    </>
  );
}