"use client"

import type { Node, NodeProps } from "@xyflow/react";
import { Handle, NodeToolbar, Position } from "@xyflow/react";
import { Copy, KeyRound, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "../ui/node-context-menu";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { NodeType } from ".";

export type CollectionNodeData = {
  label?: string;
  fields: Field[],
  onClick: (id: string) => void;
  onRename: (id: string) => void;
  onDuplicate: (node: CollectionNodeData) => void;
  onDelete: (id: string) => void;
  onFieldDelete: (collection: string, fieldId: string) => void;
  addNote: (title: string, description: string, collection?: string) => void;
  tableWidth: number
};

export type Field = {
  id: string,
  name: string,
  type: string,
  required: boolean,
  unique: boolean,
  list: boolean,
  default: string,
  primary?: boolean,
  ref?: string
}

export type CollectionNodeType = Node<CollectionNodeData>;

export default function CollectionNode({
  id,
  data,
  selected,
}: NodeProps<CollectionNodeType>) {
  const collectionRef = useRef<HTMLDivElement | null>(null);
  const [showFieldDetails, setShowFieldDetails] = useState<string>("show");
  const [showNote, setShowNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDescription, setNoteDescription] = useState("")

  useEffect(() => {
    let showFieldDetails = localStorage.getItem("field-details");
    if (showFieldDetails == null || showFieldDetails == "show") {
      setShowFieldDetails("show")
    } else {
      setShowFieldDetails("hide")
    }
  }, [])

  const checkRoute = (onClick: () => void) => {
    const path = window.location.pathname;
    if(path.includes("templates")){
      return;
    }else{
      onClick()
    }
  }

  return (
    <>
      <Dialog open={showNote} onOpenChange={(e) => setShowNote(e)}>
        <DialogContent className="text-white min-w-[40vw] border-white/5">
          <DialogTitle>Add Note</DialogTitle>
          <div className="flex flex-col gap-3">
            <input onChange={(e) => setNoteTitle(e.target.value)} value={noteTitle} type="text" className="input w-full" placeholder="Enter note title here..." />
            <textarea onChange={(e) => setNoteDescription(e.target.value)} value={noteDescription} className="input w-full h-40 resize-none" placeholder="Enter note content here..."></textarea>
            <button onClick={() => {
              data.addNote(noteTitle, noteDescription, id);
              setShowNote(false)
              setNoteDescription("")
              setNoteTitle("")
            }} className="button bg-blue-600">Add</button>
          </div>
        </DialogContent>
      </Dialog>

      <ContextMenu>
        <ContextMenuTrigger>
          <ContextMenuContent className="border-white/5 bg-secondary">
            {/* <ContextMenuItem onClick={() => data.onRename(id)} className="text-xs hover:bg-white/5 px-3 py-2">Rename</ContextMenuItem> */}
            <ContextMenuItem onClick={() => checkRoute(() => data.onDuplicate(data))} className="text-xs hover:bg-white/5 px-3 py-2">Duplicate</ContextMenuItem>
            <ContextMenuItem onClick={() => checkRoute(() => data.onDelete(id))} className="text-xs hover:bg-white/5 px-3 py-2">Delete</ContextMenuItem>
            {/* <ContextMenuItem onClick={() => setShowNote(true)} className="hover:bg-white/10 px-3 py-2">Add note</ContextMenuItem> */}
          </ContextMenuContent>
          <Handle
            type="target"
            position={Position.Top}
            id={`target-${id}`}
            style={{ background: "#555", height: "10px", width: "10px", cursor: "cell" }}
            isConnectable={true}
          />
          <div
            ref={collectionRef}
            className={twMerge(`py-2 bg-node text-white rounded-2xl shadow-md  ${selected ? "border-white/80 border-dashed" : "border-dashed border-gray-300"
              }`)} style={{
                width: `${data.tableWidth}px`
              }}
          >
            <div onClick={() => {
              checkRoute(() => {
                data.onClick(id)
              })

            }} className="flex items-center justify-between bg-node border-t-blue-500 rounded-t-lg  border-white/30 py-2 px-4 text-lg text-white font-semibold">
              <h3 >
                {data.label}
              </h3>
              {/* <span className="h-6 w-6 flex items-center justify-center bg-blue-600 rounded-md"><Copy className="stroke-2 h-3 w-3" /></span> */}
            </div>

            <div className="mt-2  relative flex flex-col gap-1 px-2">
              {data.fields.map((field, index) => (
                <div key={index} className="hover:bg-white/5 duration-300 group h-max rounded-lg py-2 text-sm border border-white/5 px-2 flex items-center relative">
                  {field.type === "primary" && (
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={`source-${index}`}
                      style={{ background: "#d6d4d4", height: "10px", width: "10px ", cursor: "cell", borderRadius: '2px', border: 'none', rotate: "45deg", transformOrigin: "top right" }}
                      isConnectable={true}
                    />
                  )}
                  <span className="flex-1 text-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-white/60 h-8 w-8 bg-white/5 rounded-lg text-[10px] font-bold flex items-center justify-center">{field.type === "string" ? "Abc" : field.type == "primary" ? "Key" : field.type === "number" ? "123" : field.type === "boolean" ? "True" : field.type === "date" ? "Date" : "Ref "}</div>
                      <span className="custom-drag-handle font-normal ">{field.name}</span>
                    </div>
                    {/* <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        data.onFieldDelete(id, field.id);
                      }}
                      className="duration-300 opacity-0 group-hover:opacity-100 h-7 w-7 hover:bg-white/10 rounded-md flex items-center justify-center"
                    >
                      <Trash2 className="text-white/50" height={16} width={16} />
                    </button> */}
                  </span>
                  {field.type === "ref" && (
                    <Handle
                      type="target"
                      position={Position.Left}
                      id={`target-${index}`}
                      style={{ background: "#d6d4d4", height: "8px", width: "8px ", cursor: "cell", borderRadius: '2px', border: 'none', rotate: "45deg", transformOrigin: "top left" }}
                      isConnectable={true}
                    />
                  )}
                  {showFieldDetails === "show" && <div className="z-[50] pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 opacity-0 duration-100 field-item w-72 rounded-lg delay-100 scale-50 group-hover:scale-100 bg-primary absolute top-1/2 -translate-y-1/2 left-[105%] origin-left">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/15 w-full">
                      <h3 className="text-base font-semibold">{field.name}</h3>
                      <p className="uppercase">{field.type == "primary" ? "KEY" : field.type}</p>
                    </div>
                    <div className="flex flex-col gap-y-2 px-4 py-3">
                      <div className="flex gap-1">
                        {field.required && <div className="w-max text-red-300 bg-red-500/20 px-2 py-1 text-xs rounded-md ">Required</div>}
                        {field.unique && <div className="w-max text-green-300 bg-green-500/20 px-2 py-1 text-xs rounded-md ">Unique</div>}
                        {field.type == "primary" && <div className="w-max text-blue-300 bg-blue-600/20 px-2 py-1 text-xs rounded-md ">Primary</div>}
                      </div>
                      <div className="text-sm flex flex-col gap-1">
                        <span><b>Default: </b> {field.default ?? "Not set"}</span>
                        {/* <span><b>Comment: </b> {field.default ?? "Not set"}</span> */}
                      </div>
                    </div>
                  </div>}
                </div>
              ))}
            </div>
          </div>
        </ContextMenuTrigger>
      </ContextMenu>
    </>
  );
}