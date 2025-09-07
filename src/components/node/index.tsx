import { Handle, Position } from '@xyflow/react'
import React, { memo } from 'react'
import { twMerge } from 'tailwind-merge'
import { NodeProps } from '@xyflow/react'
import { CollectionNodeData } from './types/collection'
import { Node } from '@xyflow/react'
import { getfieldTypeIcon } from '@/utils/fieldtype'
import { Trash2 } from 'lucide-react'
import { FieldType, IColumn } from '@/types/schemas/table'

export type CollectionNodeType = Node<CollectionNodeData>;

const CollectionNode = ({
  id,
  data,
  selected,
}: NodeProps<CollectionNodeType>) => {
  return (
    <>
      <div
        // ref={collectionRef}
        className={twMerge(`cursor-default py-2 bg-[#252729] text-white rounded-2xl shadow-md border-2 transition-all duration-200 ${selected ? "border-dashed border-white/20 scale-[1.01]" : "border-transparent"
          }`)} style={{
            width: `${350}px`
          }}
      >
        <div onClick={() => {
          //   checkRoute(() => {
          //     data.onClick(id)
          //   })

        }} className={"flex items-center justify-between bg-[#252729] rounded-t-lg  border-white/30 py-2 px-4 text-lg text-white font-semibold" + ` dbdraw_handle_${id}`}>
          <h3 >
            {data.name}
          </h3>
          <span className={"flex-1 h-6 flex rounded-md drag_handle cursor-move"}></span>
        </div>

        <div className="mt-2 relative flex flex-col gap-1 px-2">
          {data.columns.map((field: IColumn, index: number) => (
            <div key={index} className="flex-1 hover:bg-white/5 duration-300 group h-max rounded-lg py-2 text-sm border border-white/5 px-2 flex items-center relative">
              {field.type === FieldType.primary && (
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`source-${index}`}
                  style={{ background: "#d6d4d4", height: "10px", width: "10px ", cursor: "cell", borderRadius: '2px', border: 'none', rotate: "45deg", transformOrigin: "top right", }}
                  isConnectable={true}
                />
              )}
              <span className="flex-1 text-sm flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-white/60 h-8 w-8 bg-white/5 rounded-lg text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {getfieldTypeIcon(field.type)}
                  </div>
                  <span className="flex-1 min-w-0 w-[0px] truncate custom-drag-handle font-semibold">
                    {field.name}
                  </span>
                </div>
                {field.type !== FieldType.primary && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      data.onFieldDelete(id, field.id);
                    }}
                    className="duration-300 opacity-0 group-hover:opacity-100 h-7 w-7 hover:bg-white/10 rounded-md flex items-center justify-center"
                  >
                    <Trash2 className="text-white/50" height={16} width={16} />
                  </button>
                )}
              </span>

              {field.type === FieldType.ref && (
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`target-${index}`}
                  style={{ background: "#d6d4d4", height: "8px", width: "8px ", cursor: "cell", borderRadius: '2px', border: 'none', rotate: "45deg", transformOrigin: "top left", }}
                  isConnectable={true}
                />
              )}

            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default memo(CollectionNode);



// {showFieldDetails === "show" && <div className="z-[50] pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 opacity-0 duration-100 field-item w-72 rounded-lg delay-100 scale-50 group-hover:scale-100 bg-primary absolute top-1/2 -translate-y-1/2 left-[105%] origin-left">
// 	<div className="flex items-center justify-between px-4 py-3 border-b border-white/15 w-full">
// 	  <h3 className="text-base font-semibold">{field.name}</h3>
// 	  <p className="uppercase">{field.type == "primary" ? "KEY" : field.type}</p>
// 	</div>
// 	<div className="flex flex-col gap-y-2 px-4 py-3">
// 	  <div className="flex gap-1">
// 		{field.required && <div className="w-max text-red-300 bg-red-500/20 px-2 py-1 text-xs rounded-md ">Required</div>}
// 		{field.unique && <div className="w-max text-green-300 bg-green-500/20 px-2 py-1 text-xs rounded-md ">Unique</div>}
// 		{field.type == "primary" && <div className="w-max text-blue-300 bg-blue-600/20 px-2 py-1 text-xs rounded-md ">Primary</div>}
// 	  </div>
// 	  <div className="text-sm flex flex-col gap-1">
// 		<span><b>Default: </b> {field.default ?? "Not set"}</span>
// 		{/* <span><b>Comment: </b> {field.default ?? "Not set"}</span> */}
// 	  </div>
// 	</div>
//   </div>}