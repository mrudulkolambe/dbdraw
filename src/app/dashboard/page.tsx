"use client"
import { SignInButton, useAuth, UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useServices } from '@/hooks/useServices'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectGroup,
	MultiSelectItem,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@/components/ui/multi-select"
import { IProject } from '@/types/schemas/project'
import { cn } from '@/lib/utils'

const DashboardPage = () => {
	const user = useUser();
	const { projectService } = useServices();
	const [isCreatingProject, setIsCreatingProject] = useState(false);
	const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
	const [projects, setProjects] = useState<IProject[] | null>([]);
	const [selectedProject, setSelectedProject] = useState<IProject | null>(null);

	const [newProject, setNewProject] = useState({
		title: "",
		description: "",
		tags: [] as string[],
	})
	const resetFields = () => {
		setNewProject({
			title: "",
			description: "",
			tags: [],
		})
	}

	const handleNewProjectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { id, value } = e.target;
		setNewProject((prev) => ({
			...prev,
			[id]: value,
		}));
	}
	
	useEffect(() => {
		const loadProjects = async () => {
			try {
				const res = await projectService.getUserProjects();
				if (res.success) {
					console.log(res.data);
					setProjects(res.data);
				} else {
					setProjects(null);
				}
			} catch (err) {
				console.error(err);
				setProjects(null);
			}
		};

		loadProjects();
	}, [projectService]);

	const createProject = async () => {
		setIsCreatingProject(true);
		projectService.createProject({
			title: newProject.title || "Untitled Project",
			description: newProject.description || "No description",
		})
			.then((res) => {
				if (res.status === 201) {
					setProjects((prev) => {
						if (prev) {
							return [res.data, ...prev];
						}
						return [res.data];
					})
					setShowCreateProjectModal(false);
					setIsCreatingProject(false);
					resetFields();
				}
			})
			.catch((err) => {
				setIsCreatingProject(false);
			});
	}
	return (
		<>
			<section className="flex flex-col min-h-screen w-screen">
				<nav className="relative flex items-center justify-between px-4 sm:px-8 md:px-20 py-6 h-[80px] z-10 bg-[#1A1C1E]">
					<h1 className="text-xl sm:text-2xl font-bold text-white">DBDraw</h1>
					<ul className="hidden md:flex items-center gap-12 text-white/80">
						<li><Link href="/templates">Templates</Link></li>
						<li><a href="https://github.com/mrudulkolambe/dbdraw" target='_blank'>GitHub</a></li>
					</ul>
					<div className="flex items-center gap-4">
						<div className="md:hidden flex items-center gap-4 text-white/80">
							<a href="https://github.com/mrudulkolambe/dbdraw" target='_blank'>
								<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
								</svg>
							</a>
						</div>
						<div className="flex justify-end">
							{user.isSignedIn ?
								<UserButton /> :
								<SignInButton mode="modal">
									<button className="bg-blue-600 px-4 sm:px-6 py-2 sm:py-3 text-white text-sm rounded-md">Sign In</button>
								</SignInButton>
							}
						</div>
					</div>
				</nav>
				<ResizablePanelGroup
					direction="horizontal"
					className="w-screen"
					style={{ height: "calc(100vh - 80px)" }}
				>
					<ResizablePanel defaultSize={20} maxSize={25} minSize={20} className='bg-[#1A1C1E] pt-5 pb-0 flex flex-col'>
						<h1 className='px-6 text-white text-xl font-bold '>Projects</h1>

						<div className="w-full flex-1 overflow-auto mt-3 flex flex-col gap-3 hide-scrollbar px-6 pb-3">
							<Input type="text" placeholder="Search projects..." />
							<div className='flex-1 flex flex-col gap-3'>
								{
									projects?.map((project) => (
										<div key={project._id} onClick={() => setSelectedProject(project)} className='cursor-pointer group w-full h-32 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all duration-200 p-4 flex flex-col justify-between'>
											<div className='flex flex-col gap-2'>
												<div className='flex items-start justify-between'>
													<h1 className='text-white font-semibold text-sm line-clamp-1 group-hover:text-blue-200 transition-colors duration-200'>{project.title}</h1>
													<div className='flex-shrink-0 w-2 h-2 bg-green-400 rounded-full opacity-60' />
												</div>
												<p className='text-white/60 text-xs line-clamp-2 leading-relaxed group-hover:text-white/80 transition-colors duration-200'>{project.description}</p>
											</div>
											<div className='flex items-center justify-between'>
												<div className='flex items-center gap-2'>
													<div className='w-1.5 h-1.5 bg-blue-400 rounded-full' />
													<span className='text-white/40 text-xs font-medium'>Active</span>
												</div>
												<div className='flex items-center text-white/40 group-hover:text-white/60 transition-colors duration-200'>
													<svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
														<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
													</svg>
												</div>
											</div>
										</div>
									))
								}
							</div>

						</div>
					</ResizablePanel>
					<ResizableHandle />
					<ResizablePanel defaultSize={80} maxSize={80} minSize={75} className='bg-[#111315] pt-5 pb-0 flex flex-col flex-1'>
						<div className='pb-5 border-b border-white/10 px-6'>
							<div className='flex items-center justify-between'>
								<h1 className='text-white text-xl font-bold'>Project Details</h1>
								<Dialog open={showCreateProjectModal} onOpenChange={setShowCreateProjectModal} defaultOpen={false}>
									<form>
										<DialogTrigger asChild>
											<Button variant="outline">Create New Project</Button>
										</DialogTrigger>
										<DialogContent className="w-1/3">
											<DialogHeader>
												<DialogTitle>Create Project</DialogTitle>
											</DialogHeader>
											<div className="grid gap-4">
												<div className="grid gap-2">
													<Label htmlFor="title">Title</Label>
													<Input id="title" onChange={handleNewProjectChange} placeholder='Enter project name...' />
												</div>
												<div className="grid gap-2">
													<Label htmlFor="description">Description</Label>
													<Textarea id="description" onChange={handleNewProjectChange} className='h-20 resize-none' placeholder='Enter project description...' />
												</div>
												<div className="grid gap-2">
													<Label htmlFor="username-1">Tags</Label>
													<MultiSelect>
														<MultiSelectTrigger className="w-full">
															<MultiSelectValue placeholder="Select tags..." />
														</MultiSelectTrigger>
														<MultiSelectContent>
															<MultiSelectGroup>
																<MultiSelectItem value="next.js">Next.js</MultiSelectItem>
																<MultiSelectItem value="sveltekit">SvelteKit</MultiSelectItem>
																<MultiSelectItem value="astro">Astro</MultiSelectItem>
																<MultiSelectItem value="vue">Vue.js</MultiSelectItem>
															</MultiSelectGroup>
														</MultiSelectContent>
													</MultiSelect>
												</div>
											</div>
											<DialogFooter className='mt-2'>
												<DialogClose asChild>
													<Button size={"lg"} variant="outline" disabled={isCreatingProject}>Cancel</Button>
												</DialogClose>
												<Button size={"lg"} onClick={async () => {
													createProject()
												}} loading={isCreatingProject} type="submit">Create Project</Button>
											</DialogFooter>
										</DialogContent>
									</form>
								</Dialog>
							</div>
						</div>
						<div className={cn('flex-1 overflow-auto px-6 py-6 space-y-4', selectedProject ? '' : 'flex items-center justify-center')}>
							{selectedProject ? (
								<>
									{/* Project Info Card */}
									<div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-5 space-y-4'>
										<div className='flex flex-col gap-2'>
											<h2 className='text-white text-sm font-medium opacity-70'>Project Title</h2>
											<Link href={`/board/${selectedProject._id}`}><h1 className='text-white text-xl font-semibold'>{selectedProject.title}</h1></Link>
										</div>
										<div className='flex flex-col gap-2'>
											<h2 className='text-white text-sm font-medium opacity-70'>Description</h2>
											<p className='text-white/80 text-sm leading-relaxed'>{selectedProject.description}</p>
										</div>
									</div>

									{/* Metadata Card */}
									<div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-5 space-y-4'>
										<div className='flex flex-col gap-3'>
											<div className='flex flex-col gap-2'>
												<h2 className='text-white text-sm font-medium opacity-70'>Tags</h2>
												<div className='flex flex-wrap gap-2'>
													<Badge className='bg-blue-500/20 text-blue-200 border-blue-500/30'>React</Badge>
													<Badge className='bg-green-500/20 text-green-200 border-green-500/30'>Node.js</Badge>
													<Badge className='bg-purple-500/20 text-purple-200 border-purple-500/30'>MongoDB</Badge>
												</div>
											</div>
											<div className='flex flex-col gap-2'>
												<h2 className='text-white text-sm font-medium opacity-70'>Project ID</h2>
												<Badge variant="secondary" className='text-xs font-mono w-fit bg-white/10 text-white/80 border-white/20'>{selectedProject.projectID}</Badge>
											</div>
										</div>
									</div>

									{/* Tables Card */}
									<div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-5 space-y-4'>
										<div className='flex items-center justify-between'>
											<h2 className='text-white text-sm font-medium opacity-70'>Database Tables</h2>
											<Badge variant="secondary" className='bg-white/10 text-white/80 border-white/20'>4 tables</Badge>
										</div>
										<div>
											<Accordion type="single" collapsible>
												<AccordionItem value="item-1" className='rounded-lg bg-white/5 border border-white/10'>
													<AccordionTrigger className='w-full px-4 py-3 flex items-center rounded-t-lg justify-between text-left bg-white/5 hover:bg-white/10 transition-colors text-white font-medium'>
														Users
													</AccordionTrigger>
													<AccordionContent className='p-4 space-y-3 bg-white/[0.02]'>
														<div className='flex items-center justify-between py-2 border-b border-white/10'>
															<span className='text-white/80 text-sm font-medium'>user_id</span>
															<Badge variant="secondary" className='bg-white/10 text-white/70 border-white/20 text-xs'>String</Badge>
														</div>
														<div className='flex items-center justify-between py-2 border-b border-white/10'>
															<span className='text-white/80 text-sm font-medium'>firstname</span>
															<Badge variant="secondary" className='bg-white/10 text-white/70 border-white/20 text-xs'>String</Badge>
														</div>
														<div className='flex items-center justify-between py-2 border-b border-white/10'>
															<span className='text-white/80 text-sm font-medium'>lastname</span>
															<Badge variant="secondary" className='bg-white/10 text-white/70 border-white/20 text-xs'>String</Badge>
														</div>
														<div className='flex items-center justify-between py-2 border-b border-white/10'>
															<span className='text-white/80 text-sm font-medium'>email</span>
															<Badge variant="secondary" className='bg-white/10 text-white/70 border-white/20 text-xs'>String</Badge>
														</div>
														<div className='flex items-center justify-between py-2 border-b border-white/10'>
															<span className='text-white/80 text-sm font-medium'>role</span>
															<Badge variant="secondary" className='bg-white/10 text-white/70 border-white/20 text-xs'>String</Badge>
														</div>
														<div className='flex items-center justify-between py-2 border-b border-white/10'>
															<span className='text-white/80 text-sm font-medium'>created_at</span>
															<Badge variant="secondary" className='bg-white/10 text-white/70 border-white/20 text-xs'>String</Badge>
														</div>
														<div className='flex items-center justify-between py-2'>
															<span className='text-white/80 text-sm font-medium'>updated_at</span>
															<Badge variant="secondary" className='bg-white/10 text-white/70 border-white/20 text-xs'>String</Badge>
														</div>
													</AccordionContent>
												</AccordionItem>
											</Accordion>
										</div>
									</div>
								</>
							) : (
								/* Empty State */
								<div className='flex-1 flex items-center justify-center'>
									<div className='flex flex-col items-center gap-4 text-center'>
										<div className='w-16 h-16 bg-white/10 rounded-full flex items-center justify-center'>
											<svg className='w-8 h-8 text-white/40' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
												<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
											</svg>
										</div>
										<div className='space-y-2'>
											<h3 className='text-white text-lg font-semibold'>Select a Project</h3>
											<p className='text-white/60 text-sm leading-relaxed max-w-md'>Choose a project from the sidebar to view its details, database schema, and manage your data structures.</p>
										</div>
									</div>
								</div>
							)}
						</div>
					</ResizablePanel>
				</ResizablePanelGroup>
			</section>
		</>
	)
}

export default DashboardPage