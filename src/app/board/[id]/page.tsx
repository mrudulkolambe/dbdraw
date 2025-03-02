"use client"

import { Background, Controls, ReactFlow, BackgroundVariant, useNodesState, useEdgesState, type OnConnect, addEdge, Connection, Edge, useReactFlow, MarkerType, useKeyPress, useOnSelectionChange } from '@xyflow/react';
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useRef, useState } from 'react';

import { nodeTypes, type NodeType } from "@/components/nodes/index";
import { CollectionNodeData, CollectionNodeType, Field } from '@/components/nodes/CollectionNode';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import { v4 as uuidv4 } from 'uuid';
import { useParams } from 'next/navigation';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from '@/components/ui/menubar';
import { Check, FileDown } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Link from 'next/link';
import axios, { CancelTokenSource } from 'axios';
import { Collection, Flow } from '@/lib/model/draw.model';
import useDebounceFunction from '@/hooks/useDebounce';
import Spinner from '@/components/spinner';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation'
import { saveAs } from 'file-saver';
import { useDropzone } from 'react-dropzone';
import { twMerge } from 'tailwind-merge';
import UserButton from '@/components/clerk-components/UserButton';
import { TagsDropdown } from '@/components/ui/tags_dropdown';
import Tags from '@/lib/model/tags.model';
import { NotesNodeType } from '@/components/nodes/NotesNode';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ArrowLeft, RefreshCw } from 'lucide-react';

const initialNodes: NodeType[] = [] satisfies Node[];

export default function App() {

  const [fetching, setFetching] = useState(true)
  const [tableWidth, setTableWidth] = useState<number>(350)
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeType>([]);
  const [nodesLocal, setNodesLocal] = useState<NodeType[]>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [selectedField, setSelectedField] = useState<string>("");
  const [title, setTitle] = useState("My Flow");
  const [description, setDescription] = useState("");
  const [rfInstance, setRfInstance] = useState<any>(null);
  const params = useParams<{ id: string }>()
  const defaultViewport = { x: 0, y: 0, zoom: 0.5 };
  const [showSidebar, setShowSidebar] = useState<boolean>(true)
  const [gridType, setGridType] = useState<BackgroundVariant>(BackgroundVariant.Dots)
  const [snapToGrid, setSnapToGrid] = useState<boolean>(false)
  const [invalidRoute, setInvalidRoute] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fieldDetails, setFieldDetails] = useState<string>("show");
  const [importedFileContent, setImportedFileContent] = useState<object | undefined>();
  const [imported, setImported] = useState(false);
  const [tags, setTags] = useState<Tags[]>([])
  const [diagramTag, setDiagramTag] = useState("");
  const [nodeRenameDialogOpen, setNodeRenameDialogOpen] = useState({
    show: false,
    id: ""
  })
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [exportDBDialog, setExportDBDialog] = useState(false)
  const [exportLanguage, setExportLanguage] = useState<'typescript' | 'javascript'>('typescript');
  const selectedCollectionRef = useRef(selectedCollection);
  const flowRef = useRef<HTMLDivElement | null>(null);
  const cancelTokenSource = useRef<CancelTokenSource | null>(null);
  const router = useRouter()
  const [renameNode, setRenameNode] = useState<string>("");
  const [showTableWidthDialog, setShowTableWidthDialog] = useState(false)
  const [autosaveEnabled, setAutosaveEnabled] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [history, setHistory] = useState<{
    past: { nodes: NodeType[]; edges: Edge[] }[];
    future: { nodes: NodeType[]; edges: Edge[] }[];
  }>({
    past: [],
    future: [],
  });

  const ctrlPressed = useKeyPress(['Meta', 'Control']);
  const zPressed = useKeyPress('z');
  const yPressed = useKeyPress('y');
  const shiftPressed = useKeyPress('Shift');

  const saveToHistory = useCallback(() => {
    setHistory((prev) => ({
      past: [...prev.past, { nodes: nodes, edges: edges }],
      future: [],
    }));
  }, [nodes, edges]);

  const undo = useCallback(() => {
    if (history.past.length === 0) return;

    const newPresent = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);

    setHistory({
      past: newPast,
      future: [{ nodes, edges }, ...history.future],
    });

    setNodes(newPresent.nodes);
    setEdges(newPresent.edges);
  }, [history, nodes, edges, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (history.future.length === 0) return;

    const newPresent = history.future[0];
    const newFuture = history.future.slice(1);

    setHistory({
      past: [...history.past, { nodes, edges }],
      future: newFuture,
    });

    setNodes(newPresent.nodes);
    setEdges(newPresent.edges);
  }, [history, nodes, edges, setNodes, setEdges]);

  useEffect(() => {
    if (ctrlPressed && zPressed && !shiftPressed) {
      undo();
    } else if ((ctrlPressed && zPressed && shiftPressed) || (ctrlPressed && yPressed)) {
      redo();
    }
  }, [ctrlPressed, zPressed, yPressed, shiftPressed, undo, redo]);

  const updateDraw = useCallback(async (id: string, flow: Flow, title: string, description: string, tag: string): Promise<void> => {
    console.log(id, title, description, tag)
    if (cancelTokenSource.current) {
      cancelTokenSource.current.cancel('Operation canceled due to a new request.');
    }

    cancelTokenSource.current = axios.CancelToken.source();
    setSaving(true);

    try {
      const response = await axios.patch(
        `/api/diagram/${id}`,
        { title, flow, description, tag: tag },
        { cancelToken: cancelTokenSource.current.token }
      );

      if (response.status !== 200) {
        console.error('Error updating diagram:', response.data.message);
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log('Previous request canceled');
      } else {
        console.error('Error updating diagram:', error.message);
      }
    } finally {
      setSaving(false);
      cancelTokenSource.current = null;
    }
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      setSelectedField("")
    }
  }, [selectedCollection])


  const onSave = useCallback(() => {
    if (nodes || edges) {
      if (rfInstance && params?.id && !fetching) {
        const flow: Flow = rfInstance.toObject();
        const updatedObj = {
          name: title,
          flow: flow,
          description: description,
          last: Date.now(),
        }
        localStorage.setItem(params.id as string, JSON.stringify(updatedObj));
        updateDraw(params.id as string, flow, title, description, diagramTag);
        if (!autosaveEnabled) {
          toast.success('Changes saved manually');
        }
      }
    }
  }, [rfInstance, params, title, updateDraw, nodes, edges, autosaveEnabled]);

  useEffect(() => {
    setNodesLocal(nodes)
  }, [nodes, setNodes])

  useEffect(() => {
    let showFieldDetails = localStorage.getItem("field-details");
    let storedTableWidth = localStorage.getItem("table-width") as any;
    if (showFieldDetails == null) {
      localStorage.setItem("field-details", "show")
    } else {
      setFieldDetails(showFieldDetails)
    }

    if (storedTableWidth == null) {
      localStorage.setItem("table-width", (350).toString())
    } else {
      storedTableWidth = parseInt(storedTableWidth, 10);
      setTableWidth(storedTableWidth)
    }
    getDiagram(storedTableWidth)
  }, [])

  useEffect(() => {
    const savedAutosavePreference = localStorage.getItem('autosave-enabled');
    if (savedAutosavePreference !== null) {
      setAutosaveEnabled(savedAutosavePreference === 'true');
    }
  }, []);

  const toggleAutosave = useCallback(() => {
    setAutosaveEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('autosave-enabled', newValue.toString());
      toast.success(`Autosave ${newValue ? 'enabled' : 'disabled'}`);
      return newValue;
    });
  }, []);

  const createDraw = async (redirect: boolean, importedData?: any) => {
    const response = await fetch('/api/diagram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: importedData == null ? JSON.stringify({ title: "Untitled" }) : JSON.stringify(importedData),
    });

    const data = await response.json();
    if (response.ok) {
      onSave();
      setImported(false);
      setSelectedFile(null);
      setImportedFileContent(undefined);
      
      if (!redirect) {
        router.push(`/board/${data._id}`)
      } else {
        const anchor = document.createElement('a');
        anchor.href = `/board/${data._id}`;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.click();
      }
    } else {
      console.error('Error creating diagram:', data.message);
      toast.error('Error creating diagram');
    }
  }

  const handleShowFieldDetails = () => {
    let showFieldDetails = localStorage.getItem("field-details");
    if (showFieldDetails == null || showFieldDetails == "hide") {
      localStorage.setItem("field-details", "show")
      setFieldDetails("show")
    } else {
      localStorage.setItem("field-details", "hide")
      setFieldDetails("hide")
    }
    toast.success("Settings updated, refresh to apply", {
      duration: Infinity,
      action: {
        label: 'Refresh',
        onClick: () => window.location.reload(),
      },
    })
  }

  const debouncedOnSave = useDebounceFunction(onSave, 2000);

  useEffect(() => {
    if (autosaveEnabled && nodes.length > 0) {
      try {
        debouncedOnSave();
      } catch (error) {
        console.error('Autosave failed:', error);
        toast.error('Autosave failed. Please save manually.');
        setAutosaveEnabled(false);
        localStorage.setItem('autosave-enabled', 'false');
      }
    }
    return () => {
      if (cancelTokenSource.current) {
        cancelTokenSource.current.cancel('Component unmounted or dependencies changed');
      }
    };
  }, [nodes, edges, debouncedOnSave, autosaveEnabled]);

  const getDiagram = async (tableW: number) => {
    setFetching(true)
    const response = await fetch(`/api/diagram/${params?.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      setTitle(data.draw.title)
      window.document.title = `DBDraw | ${data.draw.title}`;
      setDescription(data.draw.description)
      setEdges(data.draw.flow.edges?.map((edge: any) => {
        return {
          ...edge,
          type: "smoothstep"
        }
      }))
      setDiagramTag(data.draw.tag)
      const newnodes = data.draw.flow.nodes.map((node: CollectionNodeType | NotesNodeType) => {
        if (node.type === "collection") {
          const newNode: CollectionNodeType = {
            ...node,
            // @ts-ignore
            data: {
              ...node.data,
              onFieldDelete: deleteField,
              onClick: setSelectedCollection,
              onDuplicate: handleNodeDuplicate,
              onRename: handleRenameDialog,
              onDelete: deleteCollection,
              addNote: addNote,
              tableWidth: tableW
            },
          }
          return newNode
        } else {
          console.log("NOTE ID GET DIAG", node.id)
          const newNode: NotesNodeType = {
            ...node,
            // @ts-ignore
            data: {
              ...node.data,
              onClick: () => { },
              onDuplicate: () => { },
              onEdit: handleNoteEdit,
              onDelete: () => { },
            },
          }
          return newNode
        }
      })
      setNodes(newnodes)
      const responseTags = await fetch('/api/tag', {
        method: 'GET',
        cache: 'force-cache',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const dataTags = await responseTags.json();
      if (responseTags.ok) {
        setTags(dataTags.tags)
      } else {
        console.error('Error creating diagram:', dataTags.message);
      }
    } else {
      setInvalidRoute(true)
    }
    setFetching(false)
  }

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      saveToHistory();
      const { source, target, sourceHandle, targetHandle } = connection;
      console.log(connection)
      const sourceNode = nodesLocal.find((node) => node.id === source);
      const targetNode = nodesLocal.find((node) => node.id === target);
      console.log(sourceNode, targetNode)

      if (!sourceNode || !targetNode) {
        toast.error("Invalid source or target node.");
        return;
      }
      if (sourceNode.type === "collection" && sourceHandle && targetHandle) {

        const sourceFieldIndex = parseInt(sourceHandle.split("-")[1]);
        const targetFieldIndex = parseInt(targetHandle.split("-")[1]);

        // @ts-ignore
        const sourceField = sourceNode.data.fields[sourceFieldIndex];
        // @ts-ignore
        const targetField = targetNode.data.fields[targetFieldIndex];

        if (sourceField && sourceField.type === "primary" && targetField && targetField.type === "ref") {
          setEdges((eds) =>
            addEdge(
              {
                id: uuidv4(),
                ...connection,
                animated: true,
                type: "smoothstep",
                style: { strokeWidth: 2, stroke: "#eee" },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                },
              },
              eds
            )
          );
        } else if (sourceField && sourceField.type === "primary" && targetField && targetField.type !== "ref") {
          toast.error("Invalid connection. Primary keys can only connect to reference fields.");
        }
      } else if (sourceNode.type === "note" && targetNode.type === "collection" && sourceHandle && targetHandle) {
        setEdges((eds) =>
          addEdge(
            {
              id: uuidv4(),
              ...connection,
              animated: true,
              style: { strokeWidth: 2, stroke: "#eee" },
              markerEnd: {
                type: MarkerType.ArrowClosed,
              },
            },
            eds
          )
        );
      }
    },
    [setEdges, nodesLocal, saveToHistory]
  );

  const handleNoteEdit = (title: string, description: string, noteId?: string) => {
    console.log(title, description, noteId, nodesLocal)
    const newNodes = nodes.map((node) => {
      console.log(node)
      if (node.type === "collection") return node;
      console.log(node.id, noteId)
      if (node.type === "note" && node.id === noteId) {
        const newNoteNode: NotesNodeType = {
          ...node,
          // @ts-ignore
          data: {
            ...node.data,
            description: description,
            label: title
          }
        }
        return newNoteNode;
      } else {
        return node;
      }
    })
    console.log(newNodes)
    // setNodes(newNodes as NodeType[])
  }
  const handleNoteDelete = (title: string, description: string, noteId?: string) => {
    console.log(title, description, noteId, nodesLocal)
    const newNodes = nodes.map((node) => {
      console.log(node)
      if (node.type === "collection") return node;
      console.log(node.id, noteId)
      if (node.type === "note" && node.id === noteId) {
        const newNoteNode: NotesNodeType = {
          ...node,
          // @ts-ignore
          data: {
            ...node.data,
            description: description,
            label: title
          }
        }
        return newNoteNode;
      } else {
        return node;
      }
    })
    console.log(newNodes)
    // setNodes(newNodes as NodeType[])
  }

  const addNote = (title: string, description: string, collection?: string) => {
    const noteID = uuidv4()
    const newNoteNode: NotesNodeType = {
      id: noteID,
      data: {
        label: title,
        description: description,
        onClick: () => { },
        onDelete: () => { },
        onEdit: handleNoteEdit,
        onDuplicate: () => { }
      },
      position: { x: 250, y: 100 * nodes.length },
      type: "note"
    }
    setNodes((nds) => nds.concat(newNoteNode));
    if (collection) {
      const edgeID = uuidv4();
      setEdges((eds) =>
        addEdge(
          {
            id: edgeID,
            ...{
              "source": noteID,
              "sourceHandle": `source-${noteID}`,
              "target": collection,
              "targetHandle": `target-${collection}`,
              "animated": true,
              "style": {
                "strokeWidth": 2,
                "stroke": "#eee"
              },
              "markerEnd": {
                "type": "arrowclosed"
              }
            },
            animated: true,
            style: { strokeWidth: 2, stroke: "#eee" },
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          },
          eds
        )
      );
    }
  }

  const addCollection = (name: string, fields: any) => {
    saveToHistory();
    const newNode: CollectionNodeType = {
      id: uuidv4(),
      data: {
        onFieldDelete: deleteField,
        label: name,
        fields: fields,
        onClick: setSelectedCollection,
        onDuplicate: handleNodeDuplicate,
        onRename: handleRenameDialog,
        onDelete: deleteCollection,
        addNote: addNote,
        tableWidth: tableWidth
      },
      position: { x: 250, y: 100 * nodes.length },
      type: "collection"
    }
    console.log(newNode)
    setNodes((nds) => nds.concat(newNode));
    setNodesLocal((nds) => nds.concat(newNode))
    setSelectedCollection("");
  };

  const deleteCollection = (id: string) => {
    saveToHistory();
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    if (selectedCollection === id) {
      setSelectedCollection("");
    }
  };

  const upsertField = (collectionId: string, field?: Field) => {
    saveToHistory();
    const newNodes = nodesLocal.map((node) => {
      if (node.type === "collection" && node.id === collectionId) {
        // @ts-ignore
        const existingFieldIndex = node.data.fields.findIndex((f) => f.id === field.id);
        if (existingFieldIndex >= 0) {
          // @ts-ignore
          node.data.fields[existingFieldIndex] = field;
        } else {
          // @ts-ignore
          node.data.fields.push(field);
        }
        return {
          ...node,
          data: {
            ...node.data,
            // @ts-ignore
            fields: [...node.data.fields],
          },
        };
      } else {
        return node;
      }
    })
    setNodes(newNodes as NodeType[]);
    setNodesLocal(newNodes as NodeType[]);
  };

  const deleteField = (collection: string, fieldId: string) => {
    saveToHistory();
    const currentNodes = [...nodes];

    if (!currentNodes.length) {
      console.error("No nodes available in state");
      return;
    }

    const collectionNode = currentNodes.find(node => node.id === collection);
    if (!collectionNode) {
      console.error("Collection not found");
      return;
    }

    const updatedNodes = currentNodes.map((node) => {
      if (node.type === "collection" && node.id === collection) {
        return {
          ...node,
          data: {
            ...node.data,
            // @ts-ignore
            fields: node.data.fields.filter((field: Field) => field.id !== fieldId),
          },
        };
      }
      return { ...node };
    });



    setNodes(updatedNodes as NodeType[]);
    setNodesLocal(updatedNodes as NodeType[]);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const content = reader.result as string;
          const jsonData = JSON.parse(content);
          setImportedFileContent(jsonData);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          toast.error('Invalid JSON file format');
          removeSelectedFile();
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setImportedFileContent(undefined);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    maxFiles: 1
  });

  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = useCallback(() => {
    zoomIn();
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut();
  }, [zoomOut]);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Save - Ctrl/Cmd + S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onSave();
      toast.success('Diagram saved');
    }

    // Undo - Ctrl/Cmd + Z
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
      e.preventDefault();
      if (history.past.length > 0) {
        undo();
        toast.success('Undo successful');
      } else {
        toast.error('Nothing to undo');
      }
    }

    // Redo - Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
    if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
      ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
      e.preventDefault();
      if (history.future.length > 0) {
        redo();
        toast.success('Redo successful');
      } else {
        toast.error('Nothing to redo');
      }
    }

    // Delete - Delete key
    if (e.key === 'Delete' && selectedCollection) {
      e.preventDefault();
      deleteCollection(selectedCollection);
      toast.success('Collection deleted');
    }

    // Rename - F2
    if (e.key === 'F2' && selectedCollection) {
      e.preventDefault();
      setNodeRenameDialogOpen({
        show: true,
        id: selectedCollection
      });
      const node = nodes.find(n => n.id === selectedCollection);
      if (node) {
        setRenameNode(node.data.label || "");
      }
    }

    // Toggle Sidebar - Ctrl/Cmd + B
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      setShowSidebar(!showSidebar);
      toast.success(`Sidebar ${showSidebar ? 'hidden' : 'shown'}`);
    }

    // New Diagram - Ctrl/Cmd + N
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      createDraw(false);
      toast.success('New diagram created');
    }

    // Toggle Autosave - Ctrl/Cmd + Shift + S
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 's') {
      e.preventDefault();
      toggleAutosave();
    }

    // Zoom In - Ctrl/Cmd + Plus
    if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
      e.preventDefault();
      handleZoomIn();
    }

    // Zoom Out - Ctrl/Cmd + Minus
    if ((e.ctrlKey || e.metaKey) && e.key === '-') {
      e.preventDefault();
      handleZoomOut();
    }

    // Fullscreen - F11
    if (e.key === 'F11') {
      e.preventDefault();
      handleFullscreen();
    }
  }, [onSave, undo, redo, history, selectedCollection, deleteCollection, showSidebar, createDraw, toggleAutosave, handleZoomIn, handleZoomOut, handleFullscreen]);

  useEffect(() => {
    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === 'F2') {
      handleRenameDialog(selectedCollectionRef.current);
    }
  }, []);

  const handleRenameDialog = (collection: string) => {
    if (collection !== "") {
      console.log("RENAME", collection, nodes)
      const node = nodes.find(n => n.id === collection);
      console.log(node)
      if (node) {
        setRenameNode(node.data.label || "");
        setTimeout(() => {
          setNodeRenameDialogOpen({
            show: true,
            id: collection
          });
        }, 0);
      }
    } else {
      toast.error("Select a collection");
    }
  };

  useEffect(() => {
    document.addEventListener("keyup", handleKeyUp)
    return () => {
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const handleNodeRename = () => {
    if (renameNode !== "") {
      const updateNodes = nodes.map((node) => {
        if (node.id === nodeRenameDialogOpen.id) {
          let newNode = { ...node };
          newNode.data.label = renameNode;
          return newNode
        } else {
          return node
        }
      })
      setNodes(updateNodes as CollectionNodeType[]);
      setNodeRenameDialogOpen({
        show: false,
        id: ""
      });
      setRenameNode("");
    } else {
      toast.error("Please enter the name of node")
    }
  }

  const handleNodeDuplicate = (node: CollectionNodeData) => {
    const newFields = node.fields.map((field) => {
      return {
        ...field,
        id: uuidv4()
      }
    })
    addCollection(`${node.label} - copy`, newFields)
  }

  const handleTableWidth = () => {
    localStorage.setItem("table-width", tableWidth.toString())
    getDiagram(tableWidth)
    setShowTableWidthDialog(false)
  }

  const isMac = typeof window !== 'undefined' && window.navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? '⌘' : 'Ctrl';

  // EXPORT

  function convertJsonToCollectionsFormat(json: any): Collection[] | null {
    try {
      const inputJson: any = JSON.parse(json);

      const { edges, nodes } = inputJson.flow;
      console.log(nodes)

      const collections: Collection[] = nodes.map((node: any) => {
        const formattedFields: Field[] = node.data.fields.map((field: Field, fieldIndex: Number) => {
          const formattedField: Field = {
            name: field.name,
            type: field.type,
            primary: field.type == "primary",
            required: field.required || false,
            unique: field.unique || false,
            default: field.default,
            list: field.list || false,
            id: field.id
          };

          if (field.type === "ref") {
            const edge = edges.find(
              (edge: any) => edge.target === node.id && edge.targetHandle === `target-${fieldIndex}`
            );

            if (edge) {
              const targetNode = nodes.find((n: any) => n.id === edge.source);
              if (targetNode) {
                formattedField.ref = targetNode.data.label;
              }
            }
          }

          return formattedField;
        });

        return {
          collectionName: node.data.label,
          fields: formattedFields,
        };
      });

      return collections;
    } catch (error) {
      console.error("Error reading or converting JSON:", (error as Error).message);
      return null;
    }
  }

  function generateTypeScriptInterfaces(collections: Collection[]): string {
    return collections.map(collection => {
      const pascalName = toPascalCase(collection.collectionName);
      // @ts-ignore
      const fields = collection.fields
      // @ts-ignore
        .filter(field => field.name !== "_id")
        // @ts-ignore
        .map(field => {
          let typeStr = '';
          switch (field.type) {
            case 'string':
              typeStr = 'string';
              break;
            case 'number':
              typeStr = 'number';
              break;
            case 'boolean':
              typeStr = 'boolean';
              break;
            case 'date':
              typeStr = 'Date';
              break;
            case 'ref':
              typeStr = field.ref ? `Types.ObjectId | ${toPascalCase(field.ref)}` : 'Types.ObjectId';
              break;
            default:
              typeStr = 'any';
          }
          if (field.list) typeStr = `${typeStr}[]`;
          return `  ${field.name}${field.required ? '' : '?'}: ${typeStr};`;
        })
        .join('\n');

      return `interface ${pascalName} extends Document {
${fields}
}`;
    }).join('\n\n');
  }

  function generateSchemas(collections: Collection[], type: string = "all", language: 'typescript' | 'javascript' = 'javascript'): string | null {
    const schemas = collections.filter((item) => {
      if (type === "all") return item;
      return item.collectionName === type;
    });

    if (!schemas.length) return null;

    let imports = language === 'typescript' 
      ? 'import mongoose, { Document, Schema, Types } from "mongoose";\n\n'
      : 'import mongoose from "mongoose";\n\n';

    if (language === 'typescript') {
      imports += generateTypeScriptInterfaces(schemas) + '\n\n';
    }

    const genertatedSchema = schemas.map((collection) => {
      const pascalCaseCollectionName = toPascalCase(collection.collectionName);
      const schemaName = language === 'typescript' 
        ? `Schema<${pascalCaseCollectionName}>`
        : 'Schema';
// @ts-ignore
      const fieldDefinitions = collection.fields
        .filter((field: Field) => field.name !== "_id")
        .map((field: Field) => {
          const fieldOptions: string[] = [];

          if (field.type === "ref" && field.ref) {
            fieldOptions.push(
              `type: ${language === 'typescript' ? 'Schema.Types.ObjectId' : 'mongoose.Schema.Types.ObjectId'}`,
              `ref: "${field.ref}"`,
              field.required ? `required: true` : ""
            );
          } else {
            fieldOptions.push(`type: ${mapFieldTypeToMongoose(field.type)}`);
            if (field.required) fieldOptions.push(`required: true`);
            if (field.unique) fieldOptions.push(`unique: true`);
            if (field.default !== undefined)
              fieldOptions.push(`default: ${JSON.stringify(field.default)}`);
            if (field.list) fieldOptions.push(`array: true`);
          }

          return `  ${field.name}: { ${fieldOptions.filter(Boolean).join(", ")} }`;
        });

      if (fieldDefinitions.length === 0) return "";

      const modelType = language === 'typescript' 
        ? `mongoose.Model<${pascalCaseCollectionName}>`
        : '';

      return `const ${pascalCaseCollectionName}Schema = new ${language === 'typescript' ? 'Schema' : 'mongoose.Schema'}({
${fieldDefinitions.join(",\n")}
});

export const ${pascalCaseCollectionName}${modelType ? `: ${modelType}` : ''} = mongoose.model${language === 'typescript' ? `<${pascalCaseCollectionName}>` : ''}("${collection.collectionName.toLowerCase()}", ${pascalCaseCollectionName}Schema);`;
    })
    .filter(Boolean)
    .join("\n\n");

    return imports + genertatedSchema;
  }

  function toPascalCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
        index === 0 ? match.toUpperCase() : match.toLowerCase()
      )
      .replace(/\s+/g, "");
  }

  function mapFieldTypeToMongoose(type: string): string {
    switch (type.toLowerCase()) {
      case "string":
        return "String";
      case "number":
        return "Number";
      case "boolean":
        return "Boolean";
      case "date":
        return "Date";
      case "ref":
        return "mongoose.Schema.Types.ObjectId";
      default:
        return "String";
    }
  }

  function exportAsMongodbFile(type: string = "all", filenames: string[], language: 'typescript' | 'javascript' = 'javascript'): void {
    const flow: Flow = rfInstance.toObject();
    const json = JSON.stringify({
      title,
      flow,
      description,
    }, null, 2);
    const collections = convertJsonToCollectionsFormat(json);
    if (collections) {
      if (type == "all") {
        collections.map((collection, index) => {
          const schemasCode = generateSchemas([collection], type, language);
          if (schemasCode) {
            console.log(schemasCode)
            const blob = new Blob([schemasCode], { type: 'text/javascript' });
            saveAs(blob, `${filenames[index]}.${language === 'typescript' ? 'ts' : 'js'}`);
          } else {
            toast.error("Unable to generate schema")
          }
        })
      } else {
        const schemasCode = generateSchemas(collections, type, language);
        if (schemasCode) {
          console.log(schemasCode)
          const blob = new Blob([schemasCode], { type: 'text/javascript' });
          saveAs(blob, `${filenames[0]}.${language === 'typescript' ? 'ts' : 'js'}`);
        } else {
          toast.error("Unable to generate schema")
        }
      }
    }
  }

  return <>

    <Dialog open={imported} defaultOpen={false}>
      <DialogContent className="sm:max-w-[425px] border-white/30">
        <DialogHeader>
          <DialogTitle className='text-white'>Import drawing</DialogTitle>
        </DialogHeader>
        {selectedFile ? (
          <div className="p-4 border-2 border-dashed border-white/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-white text-sm font-medium">{selectedFile.name}</p>
                <p className="text-white/60 text-xs">{(selectedFile.size / 1024).toFixed(2)} KB</p>
              </div>
              <button 
                onClick={removeSelectedFile}
                className="text-white/60 hover:text-white p-1 rounded hover:bg-white/10"
              >
                ×
              </button>
            </div>
          </div>
        ) : (
          <div
            {...getRootProps({ className: 'dropzone' })}
            style={{
              border: '2px dashed #cccccc',
              borderRadius: '8px',
              padding: '20px',
              color: "white",
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            <input {...getInputProps()} />
            <p>Drag &lsquo;n&rsquo; drop a file here, or <br /> click to select a file</p>
          </div>
        )}
        <DialogFooter className='flex items-center gap-2'>
          <button onClick={() => {
            setImported(false);
            removeSelectedFile();
          }} className={twMerge('button w-1/2 bg-transparent border-2 border-white/40')}>Close</button>
          <button 
            onClick={() => createDraw(true, importedFileContent)} 
            disabled={importedFileContent == null} 
            className='button w-1/2 bg-blue-600 disabled:bg-blue-600/50 border-2 border-transparent'
          >
            Import
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={showTableWidthDialog} onOpenChange={(e) => setShowTableWidthDialog(e)}>
      <DialogContent className='border-2 border-white/20 text-white'>
        <DialogHeader>
          <DialogTitle className='text-white'>Table Width</DialogTitle>
        </DialogHeader>
        <input onChange={(e) => setTableWidth(Number(e.target.value))} min={200} max={350} value={tableWidth} className='input' />
        <DialogFooter>
          <button onClick={handleTableWidth} className='bg-blue-600 button w-full'>{"Resize node"}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={nodeRenameDialogOpen.show} onOpenChange={(e) => {
      if (!e) {
        setRenameNode("");
      }
      setNodeRenameDialogOpen({ show: e, id: "" });
    }}>
      <DialogContent className='border-2 border-white/20 text-white'>
        <DialogHeader>
          <DialogTitle className='text-white'>Rename Node</DialogTitle>
        </DialogHeader>
        <input onChange={(e) => setRenameNode(e.target.value)} value={renameNode} className='input' />
        <DialogFooter>
          <button onClick={handleNodeRename} className='bg-blue-600 button w-full'>{"Rename node"}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={shareDialogOpen} onOpenChange={(e) => setShareDialogOpen(e)}>
      <DialogContent className='border-2 border-white/20 text-white'>
        <DialogHeader>
          <DialogTitle className='text-white'>Share diagram</DialogTitle>
        </DialogHeader>
        <input onChange={(e) => setRenameNode(e.target.value)} value={renameNode} className='input' />
        <DialogFooter>
          <button onClick={handleNodeRename} className='bg-blue-600 button w-full'>{"Rename node"}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={exportDBDialog} onOpenChange={(e) => setExportDBDialog(e)}>
      <DialogContent className='border-2 border-white/20 text-white'>
        <DialogHeader>
          <DialogTitle className='text-white'>Export diagram as Schema</DialogTitle>
        </DialogHeader>
        <div className='flex items-center justify-between mb-4 px-2'>
          <div className='flex items-center gap-2'>
            <button 
              onClick={() => setExportLanguage('typescript')} 
              className={`px-3 py-1 rounded ${exportLanguage === 'typescript' ? 'bg-blue-500' : 'bg-[#1a1d1f]'}`}
            >
              TypeScript
            </button>
            <button 
              onClick={() => setExportLanguage('javascript')} 
              className={`px-3 py-1 rounded ${exportLanguage === 'javascript' ? 'bg-blue-500' : 'bg-[#1a1d1f]'}`}
            >
              JavaScript
            </button>
          </div>
          <p className='text-sm text-gray-400'>{exportLanguage === 'typescript' ? '.ts' : '.js'}</p>
        </div>
        <div className='max-h-[324px] h-[324px] overflow-auto flex flex-col gap-y-2'>
          {nodes.map((node, index) => (
            <div key={index + "node_collection"} className='group hover:bg-white/5 duration-300 group rounded-lg py-3 text-sm border border-white/5 px-4 flex items-center justify-between relative font-semibold'>
              {node.data.label}{exportLanguage === 'typescript' ? '.ts' : '.js'}
              <FileDown 
                size={20} 
                onClick={() => exportAsMongodbFile(node.data.label, [`${toPascalCase(node.data.label || "")}Model`], exportLanguage)} 
                className='group-hover:opacity-100 opacity-0 text-gray-200 duration-300' 
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <button 
            onClick={() => exportAsMongodbFile(undefined, nodes.map((node) => node.data.label ? `${node.data.label}Model` : "Model"), exportLanguage)} 
            className='bg-blue-600 button w-full'
          >
            Export All
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    {
      invalidRoute ? 
      <main className='custom-cursor h-screen w-screen flex items-center flex-col relative bg-[#111315]'>
        <nav className='gap-0 min-h-[80px] h-[80px] w-screen flex px-8 items-center bg-secondary border-b-white/30 justify-between'>
          <div className='flex gap-3 items-center'>
            <Link href="/board" className="text-white hover:text-gray-300 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-semibold text-white">404 - Diagram Not Found</h1>
          </div>
          <UserButton />
        </nav>
        <section className='flex-1 w-full relative'>
          <ReactFlow
            nodes={[]}
            edges={[]}
            fitView
            nodeTypes={nodeTypes}
            panOnScroll
            minZoom={0.5}
            maxZoom={1.5}
            className="nodrag"
          >
            <Background
              style={{ backgroundColor: "#111315" }}
              color="#8c8c8c"
              size={2}
              gap={[50, 50]}
              variant={BackgroundVariant.Dots}
            />
          </ReactFlow>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
            <h2 className="text-2xl font-bold text-white mb-4">Oops! This diagram is lost in space</h2>
            <p className="text-gray-400 mb-8">Don&apos;t worry though, you can create a new one or return to your dashboard</p>
            <div className="space-x-4">
              <Link href="/board" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
              <button onClick={() => window.location.reload()} className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-[#1a1d1f] hover:bg-[#242729]">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </button>
            </div>
          </div>
        </section>
      </main>
      :
      <main className='custom-cursor h-screen w-screen flex items-center flex-col relative'>
        {fetching && <div className='h-screen w-screen z-10 fixed top-0 left-0 backdrop-blur-lg bg-black/30 flex items-center justify-center gap-2 text-white'>
          <Spinner />
          <h2 className='text-lg'>Loading...</h2>
        </div>}
        <nav className='gap-0 min-h-[80px] h-[80px] w-screen flex  px-8 items-center bg-secondary border-b-white/30 justify-between'>
          <form className='flex gap-3 items-center w-1/5'>
            <div className='flex flex-col text-white'>
              <Menubar className='py-0'>
                <MenubarMenu>
                  <MenubarTrigger className='w-max'>File</MenubarTrigger>
                  <MenubarContent className='bg-secondary border border-transparent text-white'>
                    <MenubarItem className='bg-transparent duration-100 hover:bg-white/15' onClick={() => createDraw(false)}>New</MenubarItem>
                    <MenubarItem className='bg-transparent duration-100 hover:bg-white/15' onClick={() => createDraw(true)}>New Tab</MenubarItem>
                    <MenubarItem className='bg-transparent duration-100 hover:bg-white/15' onClick={onSave}>Save ({modifierKey}S)</MenubarItem>
                    <MenubarItem className='bg-transparent duration-100 hover:bg-white/15' onClick={undo}>Undo ({modifierKey}Z)</MenubarItem>
                    <MenubarItem className='bg-transparent duration-100 hover:bg-white/15' onClick={redo}>Redo ({modifierKey}⇧Z)</MenubarItem>
                    <MenubarItem className='bg-transparent duration-100 hover:bg-white/15' onClick={() => setShareDialogOpen(true)}>Share</MenubarItem>
                    <MenubarItem className='bg-transparent duration-100 hover:bg-white/15' onClick={() => setImported(true)}>Import</MenubarItem>
                    <MenubarSub >
                      <MenubarSubTrigger >Export</MenubarSubTrigger>
                      <MenubarSubContent className='bg-secondary border border-transparent text-white'>
                        <MenubarItem className='min-w-64 bg-transparent duration-100 hover:bg-white/15' onClick={() => {
                          const flow: Flow = rfInstance.toObject();
                          const json = JSON.stringify({
                            title,
                            flow,
                            description,
                          }, null, 2);
                          console.log(JSON.stringify(flow))
                          const blob = new Blob([json], { type: 'application/json' });
                          saveAs(blob, `${title}.json`);
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
                        <MenubarItem className='min-w-64 bg-transparent duration-100 hover:bg-white/15' onClick={() => setExportDBDialog(true)}>As MongoDB Schema</MenubarItem>
                      </MenubarSubContent>
                    </MenubarSub>
                    <Link href="/board"><MenubarItem className='bg-transparent duration-100 hover:bg-white/15'>Exit</MenubarItem></Link>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger className='w-max'>View</MenubarTrigger>
                  <MenubarContent className='bg-secondary border border-transparent text-white'>
                    <MenubarItem className='bg-transparent duration-100 hover:bg-white/15 flex justify-between items-center' onClick={() => setShowSidebar(!showSidebar)}>Sidebar {showSidebar && <Check />}</MenubarItem>
                    <MenubarItem className='flex justify-between items-center bg-transparent duration-100 hover:bg-white/15' onClick={handleShowFieldDetails}>Show Field Details {fieldDetails === "show" && <Check />}</MenubarItem>
                    <MenubarSub >
                      <MenubarSubTrigger >Grids</MenubarSubTrigger>
                      <MenubarSubContent className='bg-secondary border border-transparent text-white'>
                        <MenubarItem className='flex justify-between items-center bg-transparent duration-100 hover:bg-white/15' onClick={() => setGridType(BackgroundVariant.Dots)}>Dots {gridType === BackgroundVariant.Dots && <Check />}</MenubarItem>
                        <MenubarItem className='flex justify-between items-center bg-transparent duration-100 hover:bg-white/15' onClick={() => setGridType(BackgroundVariant.Lines)}>Lines {gridType === BackgroundVariant.Lines && <Check />}</MenubarItem>
                        <MenubarItem className='flex justify-between items-center bg-transparent duration-100 hover:bg-white/15' onClick={() => setGridType(BackgroundVariant.Cross)}>Cross {gridType === BackgroundVariant.Cross && <Check />}</MenubarItem>
                      </MenubarSubContent>
                    </MenubarSub>
                    <MenubarItem className='bg-transparent duration-100 hover:bg-white/15' onClick={handleZoomIn}>Zoom In ({modifierKey}+)</MenubarItem>
                    <MenubarItem className='bg-transparent duration-100 hover:bg-white/15' onClick={handleZoomOut}>Zoom Out ({modifierKey}-)</MenubarItem>
                    <MenubarItem className='bg-transparent duration-100 hover:bg-white/15' onClick={handleFullscreen}>
                      {isFullscreen ? 'Exit Fullscreen (F11)' : 'Fullscreen (F11)'}
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger className='w-max'>Settings</MenubarTrigger>
                  <MenubarContent className='bg-secondary border border-transparent text-white'>
                    <MenubarItem
                      className='flex items-center justify-between bg-transparent duration-100 hover:bg-white/15'
                      onClick={toggleAutosave}
                    >
                      Autosave {autosaveEnabled && <Check />}
                    </MenubarItem>
                    <MenubarItem className='flex items-center justify-between bg-transparent duration-100 hover:bg-white/15' onClick={() => setSnapToGrid(!snapToGrid)}>
                      Snap To Grid {snapToGrid && <Check />}
                    </MenubarItem>
                    <MenubarItem className='bg-transparent duration-100 hover:bg-white/15' onClick={() => setShowTableWidthDialog(true)}>Table Width</MenubarItem>
                    <MenubarItem className='bg-transparent duration-100 hover:bg-white/15'>Flush Storage</MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            </div>
          </form>
          <form onSubmit={(e) => {
            e.preventDefault()
            const flow: Flow = rfInstance.toObject();
            updateDraw(params?.id as string, flow, title, description, diagramTag);
          }} className='w-3/5 flex items-center justify-between text-white'>
            <p className='text-xs'>{saving ? "Saving..." : "Saved"}</p>
            <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" className='text-center bg-transparent text-white border-none px-3 rounded-md outline-none duration-150' />
            <p className='text-xs text-transparent pointer-events-none'>{saving ? "Saving..." : "Saved"}</p>
          </form>
          <div className='w-1/5 px-8 flex justify-end gap-6 items-center'>
            {/* <div className='w-max text-white text-sm font-semibold'>Feedback</div> */}
            <UserButton />
          </div>
        </nav>
        <section className='main-panel flex w-full'>
          <ResizablePanelGroup
            direction="horizontal"
            className="w-screen  text-white"
          >
            <ResizablePanel defaultSize={18} maxSize={26} minSize={12}>
              {showSidebar && <LeftSidebar
                collections={nodes.filter((node) => node.type === "collection") as CollectionNodeType[]}
                selectedCollection={selectedCollection}
                setSelectedCollection={setSelectedCollection}
                onAddCollection={addCollection}
                onDeleteCollection={deleteCollection}
              />}
            </ResizablePanel>
            <ResizableHandle className="border-none" />

            <ResizablePanel defaultSize={60}>
              <section className='flex-1 main-panel'>
                <ReactFlow<NodeType, Edge>
                  ref={flowRef}
                  colorMode="dark"
                  panOnDrag={false}
                  onInit={setRfInstance}
                  deleteKeyCode={"Delete"}
                  defaultViewport={defaultViewport}
                  selectionOnDrag
                  nodes={nodes}
                  nodeTypes={nodeTypes}
                  onNodesChange={onNodesChange}
                  edges={edges}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  fitView
                  snapGrid={[50, 50]}
                  snapToGrid={snapToGrid}
                  nodeOrigin={[0.5, 0]}
                >
                  <Background
                    style={{
                      backgroundColor: "#111315"
                    }}
                    color="#8c8c8c"
                    size={gridType == BackgroundVariant.Dots ? 2 : 5}
                    gap={[50, 50]}
                    variant={gridType}
                  />
                  <Controls orientation='horizontal' />
                  {/* {menu && <ContextMenu onClick={onPaneClick} {...menu} />} */}
                </ReactFlow>
              </section>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={18} maxSize={26} minSize={12}>
              {showSidebar && <RightSidebar
                collection={nodes.find((col) => col.id === selectedCollection) as CollectionNodeType}
                onUpsertField={upsertField}
                onDeleteField={deleteField}
                selectedField={selectedField}
                setSelectedField={setSelectedField}
              />}
            </ResizablePanel>
          </ResizablePanelGroup>
        </section>
      </main >
    }
  </>
}