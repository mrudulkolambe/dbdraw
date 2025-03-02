"use client";

import { TagsDropdown } from '@/components/ui/tags_dropdown'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import React, { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation';
import Spinner from '@/components/spinner';
import { ArchiveRestore, Building, Check, Database, DotIcon, EllipsisVertical, Star, Trash2, Users, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Diagram } from '@/lib/model/draw.model';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import Tags from '@/lib/model/tags.model';
import { useDropzone } from 'react-dropzone';
import UserButton from '@/components/clerk-components/UserButton';
import IconSelector from '@/components/IconSelector';
import * as LucideIcons from 'lucide-react';
import { LuAArrowDown } from 'react-icons/lu';
import DynamicReactIcons from '@/components/DynamicIcons';

const Boards = () => {
	const tabs = [
		{
			ref: 'my-diagram',
			label: "My Diagrams",
			icon: <Database className='h-4 w-4 text-gray-300' />
		},
		{
			ref: 'favourite',
			label: "Favourite",
			icon: <Star className='h-4 w-4 text-gray-300' />
		},
		{
			ref: 'archived',
			label: "Archived",
			icon: <ArchiveRestore className='h-4 w-4 text-gray-300' />
		},
		{
			ref: 'trash',
			label: "Trash",
			icon: <Trash2 className='h-4 w-4 text-gray-300' />
		}
	]
	const drawInit = {
		title: "",
		description: "",
		tag: "",
		icon: "LuDatabase",
		flow: {
			nodes: [],
			edges: [],
			viewport: {
				x: 0,
				y: 0,
				zoom: 1
			}
		}
	}
	const tagInit = {
		title: "",
		tag: "",
		description: ""
	}

	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const [activeTab, setActiveTab] = useState(tabs[0]);
	const [pickedTag, setPickedTag] = useState("");
	const [diagrams, setDiagrams] = useState<Diagram[]>([])
	const [tags, setTags] = useState<Tags[]>([])
	const [filteredDiagrams, setFilteredDiagrams] = useState<Diagram[]>([])
	const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({ show: false, id: "", data: {}, isPermanent: false })
	const [drawForm, setDrawForm] = useState(drawInit);
	const [tagForm, setTagForm] = useState(tagInit);
	const [filterTag, setFilterTag] = useState("")
	const [drawOpen, setDrawOpen] = useState(false)
	const [renameDialog, setRenameDialog] = useState(false)
	const [importedFileContent, setImportedFileContent] = useState<object | undefined>();
	const [imported, setImported] = useState(false);

	useEffect(() => {
		initData();
	}, [])

	useEffect(() => {
		handleFilter(activeTab, diagrams)
	}, [activeTab])


	const createDraw = async (imported: boolean, importedData?: object) => {
		// Validate all required fields if not importing
		if (!imported) {
			if (!drawForm.title.trim() || !drawForm.description.trim() || !pickedTag) {
				toast.error('Please fill all fields and select a tag');
				return;
			}
		}
		
		setLoading(true);
		let body;
		if (imported) {
			body = importedData;
		} else {
			body = {
				...drawForm,
				tag: pickedTag
			};
		}
		const response = await fetch('/api/diagram', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		const data = await response.json();
		if (response.ok) {
			setLoading(false);
			setDrawForm(drawInit);
			setPickedTag("");
			setImported(false);
			setImportedFileContent(undefined);
			router.push(`/board/${data._id}`);
		} else {
			setLoading(false);
			toast.error('Error creating diagram');
			console.error('Error creating diagram:', data.message);
		}
	}

	const updateDraw = async (diagram: Diagram) => {
		if (!drawForm.title.trim() || !drawForm.description.trim() || !pickedTag) {
			toast.error('Please fill all fields and select a tag');
			return;
		}
		setLoading(true);
		const datamap = new Map();
		datamap.set('title', drawForm.title)
		datamap.set('description', drawForm.description)
		datamap.set('tag', pickedTag)
		datamap.set('icon', drawForm.icon)
		await handleUpdates(diagram._id, datamap)
	}

	const initData = async () => {

		// DIAGRAM
		const responseDiag = await fetch('/api/diagram', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const dataDiag = await responseDiag.json();
		if (responseDiag.ok) {
			setDiagrams(dataDiag.diagrams)
			setFilteredDiagrams(dataDiag.diagrams.filter((diagram: Diagram) => {
				return !diagram.archived && !diagram.deleted
			}))
		} else {
			console.error('Error creating diagram:', dataDiag.message);
		}

		// TAGS
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
	}

	const createTag = async () => {
		setLoading(true);
		const response = await fetch('/api/tag', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(tagForm),
		});

		const data = await response.json();
		if (response.ok) {
			setLoading(false)
			toast.success("Tag created")
			window.location.reload()
		} else {
			setLoading(false)
			console.error('Error creating diagram:', data.message);
		}
	}

	const handleTrash = (id: string, data: Map<string, any>, permanent: boolean) => {
		setConfirmDeleteDialog({ show: true, id, data, isPermanent: permanent })
	}
	const [value, setValue] = React.useState("FaUsers")
	const handleUpdates = async (id: string, data: Map<string, any>) => {
		const dataObject = Object.fromEntries(data);

		const updatePromise = fetch(`/api/diagram/${id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				...dataObject,
				tag: pickedTag || "" // Ensure tag is never undefined
			}),
		}).then(async (response) => {
			const res = await response.json();

			if (res.success) {
				let newArr = diagrams.map((diagram) => {
					if (diagram._id === id) {
						return {
							...res.draw,
							tag: res.draw.tag || "", // Ensure tag is never undefined in state
							description: res.draw.description,
							deleted: res.draw.deleted,
							favourite: res.draw.favourite,
							archived: res.draw.archived,
						};
					} else {
						return diagram;
					}
				});

				setLoading(false);
				setRenameDialog(false);
				setDiagrams(newArr);
				handleFilter(activeTab, newArr);

				// Reset form and tag after successful update
				setDrawForm(drawInit);
				setPickedTag("");

				return res;
			} else {
				throw new Error(res.message);
			}
		});

		toast.promise(updatePromise, {
			loading: 'Loading...',
			success: (res) => `Diagram has been updated successfully!`,
			error: (err) => `Error: ${err.message}`,
		});

		try {
			await updatePromise;
		} catch (error) {
			console.error('Error updating diagram:', error);
		}
	};

	const handleFilter = (activeTab: any, diagrams: Diagram[]) => {
		if (!diagrams) return;

		let filtered: Diagram[];

		switch (activeTab.ref) {
			case 'my-diagram':
				filtered = diagrams.filter((diagram: Diagram) => {
					return !diagram.archived && !diagram.deleted;
				});
				break;
			case 'favourite':
				filtered = diagrams.filter((diagram: Diagram) => {
					return !diagram.archived && !diagram.deleted && diagram.favourite;
				});
				break;
			case 'archived':
				filtered = diagrams.filter((diagram: Diagram) => {
					return diagram.archived && !diagram.deleted;
				});
				break;
			case 'trash':
				filtered = diagrams.filter((diagram: Diagram) => {
					return diagram.deleted;
				});
				break;
			default:
				// For tag filtering
				filtered = diagrams.filter((diagram: Diagram) => {
					return !diagram.archived && !diagram.deleted && diagram.tag === activeTab.ref;
				});
				break;
		}

		setFilteredDiagrams(filtered);
	}

	useEffect(() => {
		if (filterTag !== "") {
			handleFilter({
				ref: filterTag,
				label: tags.find(t => t._id === filterTag)?.title || filterTag
			}, diagrams);
		} else {
			// Reset to default view when no tag is selected
			handleFilter(activeTab, diagrams);
		}
	}, [filterTag, diagrams])

	const handleDrawForm = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
		setDrawForm({
			...drawForm,
			[e.target.id]: e.target.value
		})
	}

	const handleTagForm = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
		setTagForm({
			...tagForm,
			[e.target.id]: e.target.value
		})
	}

	const handleRename = (diagram: Diagram) => {
		setDrawForm(diagram as any)
		setPickedTag(diagram.tag._id)
	}

	const handlePermanentlyDelete = (id: string) => {
		const deletePromise = fetch(`/api/diagram/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((res) => {
				initData()
			})
		toast.promise(deletePromise, {
			loading: 'Loading...',
			success: (res) => `Diagram has been deleted successfully!`,
			error: (err) => `Error: ${err.message}`,
		});
	}

	useEffect(() => {
		if (filterTag !== "") {
			handleFilter({
				ref: filterTag
			}, diagrams)
		}
	}, [filterTag])


	const onDrop = useCallback((acceptedFiles: File[]) => {
		if (acceptedFiles.length > 0) {
			const reader = new FileReader();
			reader.onload = () => {
				try {
					const fileContent = reader.result as string;
					const jsonData = JSON.parse(fileContent);
					setImportedFileContent(jsonData)
				} catch (error) {
					console.error('Error parsing JSON:', error);
					toast.error('Error parsing JSON file. Please check the file format.');
				}
			};
			reader.readAsText(acceptedFiles[0]);
		}
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'application/json': ['.json']
		},
		maxFiles: 1
	});
	const [selectedIcon, setSelectedIcon] = useState("LuDatabase")
	const handleIconSelect = (icon: string) => {
		setSelectedIcon(icon);
		setDrawForm({
			...drawForm,
			icon: icon
		});
	}


	return (
		<>
			<section className='custom-cursor min-h-screen min-w-screen bg-primary relative'>
				<nav className="flex justify-between items-center py-8 px-32 relative z-[1]">
					<div className='w-10'>
						<img src="/logo.svg" alt="" />
					</div>
					<UserButton />
				</nav>
				<main className='h-[40vh] w-screen bg-white/5 absolute top-0 left-0 z-0'></main>
				<main className='px-32'>
					<div className='text-white py-5'>
						<h1 className='text-white font-bold text-4xl'>Database Diagrams</h1>
					</div>
					<div className='w-full h-[72vh] rounded-xl bg-white/5 backdrop-blur-lg flex items-center'>
						<div className='gap-2 flex flex-col w-3/12 h-full px-5 py-5 border-r-2 border-white/15'>
							<TagsDropdown tags={tags} setPickedTag={setFilterTag} pickedTag={filterTag} />
							{
								tabs.map((tab, index) => {
									return <div key={`tab-${index}`} onClick={() => setActiveTab(tab)} className={twMerge('border-2 duration-100 text-sm flex items-center gap-2 text-white py-3 px-5 rounded-lg w-full bg-secondary hover:bg-white/5', tab.ref == activeTab.ref ? "border-blue-500" : "border-white/15")}>
										{tab.icon}
										{tab.label}
									</div>
								})
							}
						</div>
						<div className='w-9/12 h-full px-5 py-5 flex flex-col'>
							<div className='flex items-center justify-between'>
								<h1 className='text-3xl font-bold text-white'>{activeTab.label}</h1>
								<DropdownMenu>
									<DropdownMenuTrigger className={'button bg-blue-600 w-32'}>Create</DropdownMenuTrigger>
									<DropdownMenuContent className='bg-secondary border-white/5'>
										<Dialog open={drawOpen} >
											<button onClick={() => setDrawOpen(true)} className='hover:bg-white/5 text-white relative flex  select-none items-center rounded-sm px-2 py-1.5 text-sm w-full'>Diagram</button>
											<DialogContent className='text-white border-white/30'>
												<DialogHeader className='flex items-center justify-between w-full flex-row'>
													<DialogTitle className='w-max'>Create Diagram</DialogTitle>
													<span onClick={() => setDrawOpen(false)} className='hover:border-white/50 border border-transparent h-6 w-6 hover:bg-white/20 duration-100 rounded-md flex items-center justify-center'><X className='h-4 w-4' /></span>
												</DialogHeader>
												<div className='flex flex-col gap-3'>
													<input value={drawForm.title} id='title' onChange={handleDrawForm} type="text" className='input' placeholder='Diagram name *' required />
													<TagsDropdown tags={tags} setPickedTag={setPickedTag} pickedTag={pickedTag} />
													<textarea id='description' value={drawForm.description} onChange={handleDrawForm} className='input h-32 resize-none' placeholder='Diagram description *' required></textarea>
													<IconSelector icon={drawForm.icon} onSelect={handleIconSelect} />
													<button type='button' onClick={() => createDraw(false)} className='bg-blue-600 button w-full'>{loading ? <Spinner /> : "Create"}</button>
												</div>
											</DialogContent>
										</Dialog>

										<Dialog>
											<DialogTrigger className='hover:bg-white/5 text-white relative flex  select-none items-center rounded-sm px-2 py-1.5 text-sm w-full'>Tag</DialogTrigger>
											<DialogContent className='text-white border-white/30'>
												<DialogHeader>
													<DialogTitle>Create Tag</DialogTitle>
												</DialogHeader>
												<div className='flex flex-col gap-3'>
													<input value={tagForm.title} id='title' onChange={handleTagForm} type="text" className='input' placeholder='Tag name' />
													<textarea id='description' value={tagForm.description} onChange={handleTagForm} className='input h-32 resize-none' placeholder='Tag description' ></textarea>
													<button type='button' onClick={() => createTag()} className='bg-blue-600 button w-full'>{loading ? <Spinner /> : "Create"}</button>
												</div>
											</DialogContent>
										</Dialog>
										<Dialog open={imported} defaultOpen={false}>
											<div className='relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 bg-transparent duration-100 hover:bg-white/5' onClick={() => setImported(true)}>Import</div>
											<DialogContent className="sm:max-w-[425px] border-white/5">
												<DialogHeader>
													<DialogTitle className='text-white'>Import drawing</DialogTitle>
												</DialogHeader>
												<div
													{...getRootProps({ className: 'dropzone' })}
													style={{
														border: '2px dashed #cccccc',
														borderRadius: '8px',
														padding: '20px',
														color: "white",
														fontSize: '14px',
														textAlign: 'center',
														//   backgroundColor: isDragActive ? '#333' : '#454545'
													}}
												>
													<input {...getInputProps()} />
													<p>Drag &lsquo;n&rsquo; drop a file here, or <br /> click to select a file</p>
												</div>
												<DialogFooter className='flex items-center gap-2'>
													<button onClick={() => setImported(false)} className={twMerge('button w-1/2 bg-transparent border-2 border-white/40')}>Close</button>
													<button onClick={() => createDraw(true, importedFileContent)} disabled={importedFileContent == null} className='button w-1/2 bg-blue-600 disabled:bg-blue-600 border-2 border-transparent'>Import</button>
												</DialogFooter>
											</DialogContent>
										</Dialog>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
							<div className='mt-5 flex-1 w-full grid grid-cols-3 gap-x-5 h-full overflow-auto gap-y-5'>
								{
									filteredDiagrams.length === 0 ? <h2 className='text-xl text-white'>Nothing to show...</h2> :
										filteredDiagrams.map((diagram: Diagram) => {
											return (
												<div className='h-max bg-[#1a1d1f] rounded-xl p-6 border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer group hover:shadow-lg hover:shadow-blue-500/5' key={diagram._id}>
													<div className='flex items-start justify-between mb-6'>
														<div className="text-white p-3 bg-[#0F1117] rounded-xl border border-white/5 group-hover:border-blue-500/20">
														<DynamicReactIcons iconName={diagram.icon}/>
														</div>
														<div className='flex items-center gap-2'>
															<DropdownMenu>
																<DropdownMenuTrigger asChild className='w-max'>
																	<EllipsisVertical className="h-5 w-5 text-white/50 hover:text-white" />
																</DropdownMenuTrigger>
																<DropdownMenuContent className="w-56 border border-white/5">
																	<Dialog open={renameDialog} onOpenChange={(e) => {
																		setRenameDialog(e)
																		if (e) handleRename(diagram)
																	}}>
																		<DialogTrigger className='hover:bg-white/5 text-white relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm w-full'>Rename</DialogTrigger>
																		<DialogContent className='text-white border-white/5 bg-secondary'>
																			<DialogHeader className='flex items-center justify-between w-full flex-row'>
																				<DialogTitle className='w-max'>Rename Diagram</DialogTitle>
																				<span onClick={() => setRenameDialog(false)} className='hover:border-white/50 border border-transparent h-6 w-6 hover:bg-white/20 duration-100 rounded-md flex items-center justify-center'><X className='h-4 w-4' /></span>
																			</DialogHeader>
																			<div className='flex flex-col gap-3'>
																				<input value={drawForm.title} id='title' onChange={handleDrawForm} type="text" className='input' placeholder='Diagram name *' required />
																				<TagsDropdown tags={tags} setPickedTag={setPickedTag} pickedTag={pickedTag} />
																				<textarea id='description' value={drawForm.description} onChange={handleDrawForm} className='input h-32 resize-none' placeholder='Diagram description *' required></textarea>
																				<IconSelector icon={drawForm.icon} onSelect={handleIconSelect} />
																				<button type='button' onClick={() => updateDraw(diagram)} className='bg-blue-600 button w-full'>{loading ? <Spinner /> : "Rename"}</button>
																			</div>
																		</DialogContent>
																	</Dialog>
																	<DropdownMenuItem onClick={() => {
																		handleUpdates(diagram._id, new Map([['favourite', !diagram.favourite]]));
																	}} className='bg-transparent duration-100 hover:bg-white/5 py-2 flex items-center justify-between'>
																		{diagram.favourite ? "Remove from favourite" : "Add to favourite"}
																	</DropdownMenuItem>
																	<DropdownMenuItem onClick={() => {
																		handleUpdates(diagram._id, new Map([['archived', !diagram.archived]]));
																	}} className='bg-transparent duration-100 hover:bg-white/5 py-2 flex items-center justify-between'>
																		{diagram.archived ? "Remove from archive" : "Add to archive"}
																	</DropdownMenuItem>
																	<DropdownMenuItem onClick={() => {
																		diagram.deleted ? handleUpdates(diagram._id, new Map([['deleted', !diagram.deleted]])) : handleTrash(diagram._id, new Map([['deleted', !diagram.deleted]]), false);
																	}} className='text-red-400 bg-transparent duration-100 hover:bg-white/5 py-2 flex items-center justify-between'>
																		{diagram.deleted ? "Restore" : "Move to trash"}
																	</DropdownMenuItem>
																	{diagram.deleted && <DropdownMenuItem onClick={() => {
																		handleTrash(diagram._id, new Map([['deleted', !diagram.deleted]]), true);
																	}} className='text-red-400 bg-transparent duration-100 hover:bg-white/5 py-2 flex items-center justify-between'>
																		{"Delete permanently"}
																	</DropdownMenuItem>}
																</DropdownMenuContent>
															</DropdownMenu>
														</div>
													</div>
													<Link href={`/board/${diagram._id}`} className="space-y-3">
														<h3 className="truncate text-lg font-semibold text-white group-hover:text-blue-500 transition-colors">
															{diagram.title} {diagram.title}
														</h3>
														<div className="flex items-center gap-2">
															<div className="text-white/60 text-sm">
																{diagram.tag?.title || 'No Tag'}
															</div>
														</div>
													</Link>
												</div>
											)
										})
								}
							</div>
						</div>
					</div>
				</main>
			</section>

			<div>
				<Dialog modal={true} open={confirmDeleteDialog.show} defaultOpen={false}>
					<DialogContent className='w-[25vw] text-white border-white/5 bg-secondary'>
						<DialogHeader>
							<DialogTitle>{confirmDeleteDialog.isPermanent ? "Delete permanently" : "Move to trash"}</DialogTitle>
						</DialogHeader>
						<DialogDescription className='mt-2'>Are you sure you want to delete this diagram? <br /> This action is irreverseable</DialogDescription>
						<DialogFooter className='flex items-center gap-2 h-max'>
							<button onClick={() => setConfirmDeleteDialog({ show: false, id: "", data: {}, isPermanent: false })} className={twMerge('w-1/2 bg-transparent border-2 border-white/40 text-sm rounded-lg h-[50px]')}>Close</button>
							<button onClick={() => {
								if (confirmDeleteDialog.isPermanent) {
									handlePermanentlyDelete(confirmDeleteDialog.id)
								} else {
									handleUpdates(confirmDeleteDialog.id, new Map([['deleted', true]]))
								}
								setConfirmDeleteDialog({ show: false, id: "", data: {}, isPermanent: false })
							}
							} className={twMerge('w-1/2 bg-red-600  border-2 border-transparent', 'h-[50px] text-sm rounded-lg')}>Delete</button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

		</>
	)
}

export default Boards