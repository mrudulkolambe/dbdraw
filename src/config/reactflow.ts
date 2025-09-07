import { MarkerType, ReactFlowProps } from "@xyflow/react";

export const REACTFLOW_CONFIG: ReactFlowProps = {
	defaultEdgeOptions:
	{
		deletable: true,
		animated: true,
		type: "smoothstep",
		markerEnd: {
			type: MarkerType.ArrowClosed,
		},
		selectable: true,
		focusable: false,
	}
}