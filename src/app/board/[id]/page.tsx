"use client"
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { addEdge, applyEdgeChanges, applyNodeChanges, Background, BackgroundVariant, Connection, Controls, Edge, EdgeChange, MarkerType, OnConnect, OnEdgesChange, OnNodesChange, ReactFlow, useReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css';
import NODE_TYPES from '@/types/nodes'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import BoardLeftSidebar from '@/components/board/leftsidebar'
import BoardRightSidebar from '@/components/board/rightsidebar'
import { REACTFLOW_CONFIG } from '@/config/reactflow'
import { v4 as uuidv4 } from 'uuid';
import node, { CollectionNodeType } from '@/components/node'
import { ContextMenuType } from '@/types/menu';
import CollectionNodeContextMenu from '@/components/node/context-menu';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from '@/components/ui/menubar';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { IColumn, ITable } from '@/types/schemas/table';
import { KeyboardActions } from '@/types/keyboard';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';
import project from '@/api/project';
import { CollectionNodeData } from '@/components/node/types/collection';
import { IEdge } from '@/types/schemas/edge';
import { useServices } from '@/hooks/useServices';

const BoardPage = () => {
	const { id } = useParams();
	const { projectService, tableService, edgeService } = useServices();
	const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
	const [selectedField, setSelectedField] = useState<IColumn | null>(null);
	const [nodes, setNodes] = useState<CollectionNodeType[]>([]);
	const [edges, setEdges] = useState<Edge[]>([]);
	const reactFlow = useReactFlow();
	const rfInstance = useRef<HTMLDivElement | null>(null);
	const [showMenu, setShowMenu] = useState<ContextMenuType | null>(null);
	const [isFieldUpdating, setIsFieldUpdating] = useState(false);
	const titleRef = useRef<HTMLInputElement | null>(null);
	const [project, setProject] = useState({
		title: "",
		description: "",
	})
	const [init, setInit] = useState({
		isFetching: true,
		fetched: false,
	});

	const [isSaving, setIsSaving] = useState(false);
	const [lastSaved, setLastSaved] = useState<Date | null>(null);
	const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const periodicSaveRef = useRef<NodeJS.Timeout | null>(null);

	// Autosave configuration
	const AUTOSAVE_CONFIG = {
		debounceDelay: 2000, // 2 seconds after last change
		periodicInterval: 30000, // 30 seconds periodic save
		enabled: true
	};

	const customActions: KeyboardActions = {
		save: (): void => {
			saveProject();
			console.log('Document saved!');
		},

		copy: (): void => {
			navigator.clipboard.writeText("content");
			console.log('Content copied to clipboard');
		},

		clearAll: (): void => {
			console.log('All content cleared');
		}
	};

	useKeyboardShortcuts(customActions);

	const selectCollection = (collectionId: string) => {
		// Use React Flow's native selection
		reactFlow.setNodes((nodes) =>
			nodes.map((node) => ({
				...node,
				selected: node.id === collectionId
			}))
		);
		setSelectedCollection(collectionId);
	}

	const selectField = (field: IColumn | null) => {
		setSelectedField(field as IColumn | null);
	}

	useEffect(() => {
		if (selectedCollection) {
			setSelectedField(null)
		}
	}, [selectedCollection]);

	const addCollection = (id: string, name: string, columns: IColumn[], onAdd: () => void) => {
		const newNode = {
			id: id,
			dragHandle: `.drag_handle`,
			type: 'collection',
			data: {
				columns: columns,
				name: name,
				onFieldDelete: deleteField,
			},
			position: { x: 0, y: 0 },
		}
		reactFlow.addNodes(newNode);
		onAdd();
	};

	const onNodeContextMenu = useCallback(
		(event: React.MouseEvent<Element, MouseEvent>, node: CollectionNodeType) => {
			console.log("context menu", event, node);
			event.preventDefault();
			if (!rfInstance.current) return;
			const pane = rfInstance.current.getBoundingClientRect();
			const x = event.clientX - pane.left + 10;
			const y = event.clientY - pane.top + 10;

			setShowMenu({
				collection: node,
				top: y < pane.height - 200 ? y : false,
				left: x < pane.width - 200 ? x : false,
				right: x >= pane.width - 200 ? pane.width - x : false,
				bottom: y >= pane.height - 200 ? pane.height - y : false,
			});
		},
		[setShowMenu],
	);

	const onPaneClick = useCallback(() => setShowMenu(null), [setShowMenu]);

	useEffect(() => {
		initProject()
	}, []);

	const initProject = async () => {
		setInit({ isFetching: true, fetched: false });
		projectService.getProjectById(id as string).then((res) => {
			console.log("Fetched project", res.data);
			setProject({
				title: res.data?.title || "Untitled Project",
				description: res.data?.description || ""
			})
			reactFlow.setNodes(res.data?.tables.map((table) => ({
				id: table.id,
				position: table.position,
				type: 'collection',
				dragHandle: `.drag_handle`,
				data: {
					...table.data,
					onFieldDelete: deleteField,
				}
			})) ?? []);
			reactFlow.setEdges(res.data?.edges.map((edge) => ({
				id: edge.id,
				source: edge.sourceTableID,
				target: edge.targetTableID,
				sourceHandle: edge.sourceColumnID,
				targetHandle: edge.targetColumnID,
				animated: true,
				markerEnd: {
					type: MarkerType.ArrowClosed,
				},
				style: { stroke: '#fff', strokeWidth: 2 },
			})) ?? []);
			setInit({ isFetching: false, fetched: true });
		})
	}

	const saveProject = useCallback(async () => {
		if (isSaving) return;

		if (init.isFetching && !init.fetched) return;
		if (!init.fetched) return;

		if (!(init.isFetching === false && init.fetched === true)) return;

		try {
			setIsSaving(true);
			const updatedNodes = reactFlow.getNodes() as CollectionNodeType[];
			const updatedEdges = reactFlow.getEdges();
			const tables = updatedNodes.map((node: CollectionNodeType) => {
				return {
					id: node.id,
					position: {
						x: node.position.x,
						y: node.position.y
					},
					data: {
						columns: node.data.columns,
						name: node.data.name,
					},
					projectID: id as string,
					type: "collection"
				};
			}) as ITable[];

			const edges = updatedEdges.map((edge) => {
				return {
					id: edge.id,
					projectID: id as string,
					sourceColumnID: edge.sourceHandle as string,
					targetColumnID: edge.targetHandle as string,
					sourceTableID: edge.source,
					targetTableID: edge.target,
					name: "",
				}
			}) as IEdge[];

			const response = await projectService.saveProject(id as string, {
				title: project.title,
				description: project.description,
				tables: tables,
				edges: edges as IEdge[],
			});

			if (response.status === 200) {
				setLastSaved(new Date());
				console.log('Project saved successfully');
			} else {
				console.error('Failed to save project:', response.message);
			}
		} catch (error) {
			console.error('Error saving project:', error);
		} finally {
			setIsSaving(false);
		}
	}, [id, isSaving, projectService, init, project.title, project.description]);

	const debouncedSave = useCallback(() => {
		console.log("debounced save called");
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
		}

		saveTimeoutRef.current = setTimeout(() => {
			const nodes = reactFlow.getNodes();
			const edges = reactFlow.getEdges();
			if (nodes.length === 0 && edges.length === 0) return;
			saveProject();
		}, AUTOSAVE_CONFIG.debounceDelay);
	}, [saveProject]);

	const upsertField = useCallback((tableId: string, field: IColumn) => {
		let node = reactFlow.getNode(tableId) as CollectionNodeType;
		if (!node) {
			// TODO: show error
			return;
		}
		const existingFieldIndex = node.data.columns.findIndex((f) => f.id === field.id);
		let fields = [...node.data.columns];
		if (existingFieldIndex >= 0) {
			fields[existingFieldIndex] = field;
		} else {
			fields.push(field)
		}

		const updatedNode = {
			id: node.id,
			data: {
				name: node.data.name,
				columns: fields
			},
			position: node.position,
			projectID: id as string,
			type: "collection"
		} as ITable;
		reactFlow.updateNode(tableId, updatedNode as any);
		setSelectedField(null);
		debouncedSave();
	}, [debouncedSave]);

	const deleteField = useCallback((tableId: string, fieldId: string) => {
		const node = reactFlow.getNode(tableId) as CollectionNodeType;
		if (!node) {
			// TODO: show error 
			return;
		}
		const updatedNode = {
			id: node.id,
			data: {
				name: node.data.name,
				columns: node.data.columns.filter(col => col.id !== fieldId)
			},
			position: node.position,
			projectID: id as string,
			type: "collection"
		} as ITable;
		reactFlow.updateNode(tableId, updatedNode as any);
		setSelectedField(null);
		debouncedSave();
	}, [debouncedSave]);

	const onNodesChange: OnNodesChange = useCallback(
		(changes) => {
			const selected = changes.find((c) => c.type === 'select' && c.selected);
			if (selected && selected.type === 'select' && selected.selected) {
				setSelectedCollection(selected.id);
			}
			setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot) as CollectionNodeType[]);
			console.log("node changes", changes);
			const hasModifyingChanges = changes.some(change =>
				change.type === 'position' ||
				change.type === 'dimensions' ||
				change.type === 'remove' ||
				change.type === 'add'
			);

			console.log("hasModifyingChanges", hasModifyingChanges);

			if (hasModifyingChanges) {
				debouncedSave();
			}
		},
		[setNodes, debouncedSave],
	);

	const onEdgesChange: OnEdgesChange = useCallback(
		(changes) => {
			setEdges((edgesSnapshot: Edge[]) => {
				return applyEdgeChanges(changes, edgesSnapshot);
			})
			const hasModifyingChanges = changes.some(change =>
				change.type === 'remove' ||
				change.type === 'add'
			);

			if (hasModifyingChanges) {
				debouncedSave();
			}
		},
		[setEdges, debouncedSave],
	);

	const onConnect: OnConnect = useCallback(
		(params: Connection) => {
			if (params.source === params.target) return;
			const newEdge = {
				id: uuidv4(),
				...params,
				animated: true,
				markerEnd: {
					type: MarkerType.ArrowClosed,
				},
				style: { stroke: '#fff', strokeWidth: 2 },
			} as Edge;
			setEdges((edgesSnapshot) => {
				return addEdge(newEdge, edgesSnapshot)
			})
			edgeService.createEdge({
				id: newEdge.id,
				projectID: id as string,
				sourceColumnID: newEdge.sourceHandle as string,
				targetColumnID: newEdge.targetHandle as string,
				sourceTableID: newEdge.source as string,
				targetTableID: newEdge.target as string,
				name: "",
			}).then((res) => {
				if (res.status === 200) {
					console.log("Edge created successfully");
				} else {
					console.error("Failed to create edge:", res.message);
				}
			}).catch((err) => {
				console.error("Error creating edge:", err);
			})
			// debouncedSave();
		},
		[setEdges, debouncedSave],
	);

	useEffect(() => {
		periodicSaveRef.current = setInterval(() => {
			const nodes = reactFlow.getNodes();
			const edges = reactFlow.getEdges();
			if (nodes.length === 0 && edges.length === 0) return;
			saveProject();
		}, AUTOSAVE_CONFIG.periodicInterval);

		return () => {
			if (periodicSaveRef.current) {
				clearInterval(periodicSaveRef.current);
			}
		};
	}, [saveProject, nodes.length, edges.length]);

	const deleteTable = async (tableID: string) => {
		try {
			const response = await tableService.deleteTable(tableID);
			if (response.status === 200) {
				console.log("Table deleted successfully");
			} else {
				console.error("Failed to delete table:", response.message);
			}
		} catch (error) {
			console.error("Error deleting table:", error);
		}
	}

	const deleteEdges = async (edgeIDs: string[]) => {
		console.log("Edges deleted:", edgeIDs);
		edgeService.deleteEdges(edgeIDs).then((res) => {
			if (res.status === 200) {
				console.log("Edges deleted successfully");
			} else {
				console.error("Failed to delete edges:", res.message);
			}
		}).catch((err) => {
			console.error("Error deleting edges:", err);
		});
	}

	return (
		<>
			<section className="flex flex-col min-h-screen w-screen">
				<nav className='gap-0 min-h-[80px] h-[80px] w-screen flex  px-8 items-center bg-[#1A1C1E] border-b-white/30 justify-between'>
					<form className='flex gap-3 items-center w-1/5'>
						<div className='flex flex-col text-white'>
							<Menubar className='py-0'>
								<MenubarMenu>
									<MenubarTrigger className='w-max'>File</MenubarTrigger>
									<MenubarContent className='bg-secondary border border-transparent text-white'>
										<MenubarItem className='bg-transparent duration-100 hover:bg-white/15' onClick={() => {
											// createDraw(false)
										}}>New</MenubarItem>
										<MenubarItem className='bg-transparent duration-100 hover:bg-white/15' onClick={() => [
											// createDraw(true)
										]}>New Tab</MenubarItem>
										<MenubarItem className='bg-transparent duration-100 hover:bg-white/15' onClick={() => {
											saveProject();
										}}>Save (Ctrl + S)</MenubarItem>
										<MenubarItem className='bg-transparent duration-100 hover:bg-white/15' onClick={() => {
											// undo()
										}}>Undo ({ }Z)</MenubarItem>
										<MenubarItem className='bg-transparent duration-100 hover:bg-white/15' onClick={() => {
											// redo()
										}}>Redo ({ }⇧Z)</MenubarItem>
										<MenubarItem className='bg-transparent duration-100 hover:bg-white/15' onClick={() => {
											// setShareDialogOpen(true)
										}}>Share</MenubarItem>
										<MenubarItem className='bg-transparent duration-100 hover:bg-white/15' onClick={() => {
											// setImported(true)
										}}>Import</MenubarItem>
										<MenubarSub >
											<MenubarSubTrigger >Export</MenubarSubTrigger>
											<MenubarSubContent className='bg-secondary border border-transparent text-white'>
												<MenubarItem className='min-w-64 bg-transparent duration-100 hover:bg-white/15' onClick={() => {
													// const flow: Flow = rfInstance.toObject();
													// const json = JSON.stringify({
													//   title,
													//   flow,
													//   description,
													// }, null, 2);
													// console.log(JSON.stringify(flow))
													// const blob = new Blob([json], { type: 'application/json' });
													// saveAs(blob, `${title}.json`);
												}}>As JSON file</MenubarItem>
												{/* <MenubarItem className='min-w-64 bg-transparent duration-100 hover:bg-white/15' onClick={() => {
                          const flow: Flow = rfInstance.toObject();
                          const json = JSON.stringify({
                            title,
                            flow,
                            description,
                          }, null, 2);
                          const collections = convertJsonToCollectionsFormat(json);
                          if (collections) {
                            console.log("Converted Collections:", JSON.stringify(collections, null, 2));

                            const schemasCode = generateSchemas(collections);
                            if (schemasCode) {
                              const blob = new Blob([schemasCode], { type: 'text/javascript' });
                              saveAs(blob, `Schema.js`);
                            } else {
                              toast.error("Unable to generate schema")
                            }
                          }
                        }}>As MongoDB Schema</MenubarItem> */}
												<MenubarItem className='min-w-64 bg-transparent duration-100 hover:bg-white/15' onClick={() => {
													// setExportDBDialog(true)
												}}>As MongoDB Schema</MenubarItem>
											</MenubarSubContent>
										</MenubarSub>
										<Link href="/board"><MenubarItem className='bg-transparent duration-100 hover:bg-white/15'>Exit</MenubarItem></Link>
									</MenubarContent>
								</MenubarMenu>
								<MenubarMenu>
									<MenubarTrigger className='w-max'>View</MenubarTrigger>
									<MenubarContent className='bg-secondary border border-transparent text-white'>
										<MenubarItem className='bg-transparent duration-100 hover:bg-white/15 flex justify-between items-center' onClick={() => {
											// setShowSidebar(!showSidebar)
										}}>Sidebar
											{/* {showSidebar && <Check />} */}
										</MenubarItem>
										<MenubarItem className='flex justify-between items-center bg-transparent duration-100 hover:bg-white/15' onClick={() => {
											// handleShowFieldDetails()
										}}>Show Field Details {<Check />}</MenubarItem>
										<MenubarSub >
											<MenubarSubTrigger >Grids</MenubarSubTrigger>
											<MenubarSubContent className='bg-secondary border border-transparent text-white'>
												<MenubarItem className='flex justify-between items-center bg-transparent duration-100 hover:bg-white/15' onClick={() => {
													// setGridType(BackgroundVariant.Dots)
												}}>Dots {<Check />}</MenubarItem>
												<MenubarItem className='flex justify-between items-center bg-transparent duration-100 hover:bg-white/15' onClick={() => {
													// setGridType(BackgroundVariant.Lines)
												}}>Lines {<Check />}</MenubarItem>
												<MenubarItem className='flex justify-between items-center bg-transparent duration-100 hover:bg-white/15' onClick={() => {
													// setGridType(BackgroundVariant.Cross)
												}}>Cross {<Check />}</MenubarItem>
											</MenubarSubContent>
										</MenubarSub>
										<MenubarItem className='bg-transparent duration-100 hover:bg-white/15' onClick={() => {
											// handleZoomIn()
										}}>Zoom In ({ }+)</MenubarItem>
										<MenubarItem className='bg-transparent duration-100 hover:bg-white/15' onClick={() => {
											// handleZoomOut()
										}}>Zoom Out ({ }-)</MenubarItem>
										<MenubarItem className='bg-transparent duration-100 hover:bg-white/15' onClick={() => {
											// handleFullscreen()
										}}>
											{true ? 'Exit Fullscreen (F11)' : 'Fullscreen (F11)'}
										</MenubarItem>
									</MenubarContent>
								</MenubarMenu>
								<MenubarMenu>
									<MenubarTrigger className='w-max'>Settings</MenubarTrigger>
									<MenubarContent className='bg-secondary border border-transparent text-white'>
										<MenubarItem
											className='flex items-center justify-between bg-transparent duration-100 hover:bg-white/15'
											onClick={() => {
												// toggleAutosave()
											}}
										>
											Autosave {<Check />}
										</MenubarItem>
										<MenubarItem className='flex items-center justify-between bg-transparent duration-100 hover:bg-white/15' onClick={() => {
											// setSnapToGrid(!snapToGrid)
										}}>
											Snap To Grid {<Check />}
										</MenubarItem>
										<MenubarItem className='bg-transparent duration-100 hover:bg-white/15' onClick={() => {
											// setShowTableWidthDialog(true)
										}}>Table Width</MenubarItem>
										<MenubarItem className='bg-transparent duration-100 hover:bg-white/15'>Flush Storage</MenubarItem>
									</MenubarContent>
								</MenubarMenu>
							</Menubar>
						</div>
					</form>
					<form onSubmit={(e) => {
						e.preventDefault()
						saveProject();
						if (titleRef.current) {
							titleRef.current.blur();
						}
					}} className='w-3/5 flex items-center justify-between text-white'>
						<p className='text-xs'>{isSaving ? "Saving..." : "Saved"}</p>
						<input ref={titleRef} value={project.title} onChange={(e) => {
							setProject({ ...project, title: e.target.value })
						}} type="text" className='text-center bg-transparent text-white border-none px-3 rounded-md outline-none duration-150' />
						<p className='text-xs text-transparent pointer-events-none'>{isSaving ? "Saving..." : "Saved"}</p>
					</form>
					<div className='w-1/5 px-8 flex justify-end gap-6 items-center'>
						{/* <div className='w-max text-white text-sm font-semibold'>Feedback</div> */}
						<UserButton />
					</div>
				</nav>
				<div className='flex w-screen section-height'>
					<ResizablePanelGroup direction="horizontal">
						<ResizablePanel defaultSize={18} maxSize={26} minSize={12} className='bg-white' >
							<BoardLeftSidebar
								collections={nodes
									.filter((node) => node.data.name !== undefined)
									.map((node) => {
										return {
											id: node.id,
											name: node.data.name,
										}
									})}
								selectedCollection={selectedCollection as string | null}
								selectCollection={selectCollection}
								onAddCollection={addCollection}
								onDeleteCollection={(tableID) => {
									const table = reactFlow.getNode(tableID);
									if (!table) return;
									reactFlow.deleteElements({ nodes: [table] });
								}}
							/>
						</ResizablePanel>
						<ResizableHandle />
						<ResizablePanel defaultSize={60} >
							<ReactFlow
								ref={rfInstance}
								nodes={nodes}
								nodeTypes={NODE_TYPES}
								onNodesChange={onNodesChange}
								edges={edges}
								onEdgesChange={onEdgesChange}
								onConnect={onConnect}
								onBeforeDelete={async ({ nodes, edges }) => {
									console.log("before delete", nodes, edges);
									return true;
								}}
								onNodesDelete={async (nodes) => {
									if (nodes.length === 0) return;
									await deleteTable(nodes[0].id);
								}}
								onEdgeClick={(e) => console.log(e)}
								onEdgesDelete={async (e) => {
									await deleteEdges(e.map(edge => edge.id));
								}}
								elevateEdgesOnSelect={true}
								defaultEdgeOptions={REACTFLOW_CONFIG.defaultEdgeOptions}
								fitView
								fitViewOptions={{ padding: 0.5 }}
								onPaneClick={onPaneClick}
								onNodeContextMenu={onNodeContextMenu}
							>
								{showMenu && (
									<CollectionNodeContextMenu
										collection={showMenu.collection}
										top={showMenu.top}
										left={showMenu.left}
										right={showMenu.right}
										bottom={showMenu.bottom}
										deleteTable={(tableID: string) => {
											const table = reactFlow.getNode(tableID);
											if (!table) return;
											reactFlow.deleteElements({ nodes: [table] });
										}}
										onClick={onPaneClick}
									/>
								)}

								<Background
									style={{ backgroundColor: "#111315" }}
									color="#8c8c8c"
									size={2}
									gap={[50, 50]}
									variant={BackgroundVariant.Dots}
								/>
								<Controls />
							</ReactFlow>
						</ResizablePanel>
						<ResizableHandle />
						<ResizablePanel defaultSize={18} maxSize={26} minSize={12} className='bg-white'>
							<BoardRightSidebar
								collection={nodes.find((col) => col.id === selectedCollection)}
								onUpsertField={upsertField}
								onDeleteField={deleteField}
								selectedField={selectedField}
								setSelectedField={selectField}
								isFieldUpdating={isFieldUpdating}
							/>
						</ResizablePanel>
					</ResizablePanelGroup>

				</div>
			</section>
		</>
	)
}

export default BoardPage