"use client"

import React from 'react'
import UserButton from "@/components/clerk-components/UserButton";
import { SignInButton, useUser } from "@clerk/nextjs";
import Link from 'next/link';
import Noise from '@/effects/Animations/Noise/Noise';
import Squares from '@/effects/Backgrounds/Squares/Squares';
import { Toaster, toast } from 'sonner';

const Home = () => {
	const user = useUser();
	return (
		<>
			<Toaster
				duration={3000}
				position="bottom-right"
				theme="dark"
				toastOptions={{
					className: "border-white/30 border bg-black/5 backdrop-blur-md",
					actionButtonStyle: {
						color: "white",
						backgroundColor: "rgba(255, 255, 255, 0.1)",
						padding: "20"
					},
					classNames: {
						title: 'text-white',
					}
				}} />
			<div className="bg-primary relative z-0 max-w-screen min-h-screen overflow-x-hidden">
				<div className='h-full w-full fixed top-0 left-0 z-0'><Squares
					speed={0.1}
					squareSize={40}
					direction='diagonal'
					borderColor='#1B2E55'
					hoverFillColor='#222'
				/>
					<Noise
						patternSize={250}
						patternScaleX={1}
						patternScaleY={1}
						patternRefreshInterval={2}
						patternAlpha={30}
					/>
				</div>

				<nav className="relative flex items-center justify-between px-4 sm:px-8 md:px-20 py-6 h-[80px] z-10 bg-transparent">
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
				<section className="relative z-10 flex items-center max-w-screen px-4 sm:px-8 md:px-0 min-h-[calc(100vh-80px)] pb-12">
					<div className="flex items-center justify-around flex-col w-full">
						<h1 className="text-center font-bold text-4xl sm:text-5xl md:text-7xl text-white leading-tight sm:leading-[4.5rem] mt-8">Sketch Your Database,<br />Build Your Backend Faster</h1>
						<p className="mt-6 sm:mt-8 w-full sm:w-3/4 md:w-2/5 text-center text-white/60 font-normal px-4 sm:px-0">Welcome to the future of schema building! Our intuitive no-code platform empowers you to design, visualize, and customize your database schemas effortlessly.</p>
						{user.isSignedIn ?
							<Link href="/board" className="mt-6 bg-blue-600 px-4 sm:px-6 py-2 sm:py-3 text-white text-sm rounded-md">Start Building</Link> :
							<SignInButton mode="modal">
								<button className="mt-6 bg-blue-600 px-4 sm:px-6 py-2 sm:py-3 text-white text-sm rounded-md">Start Building</button>
							</SignInButton>
						}
						<div className='mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full sm:w-[90vw] md:w-[80vw] mx-auto px-4 sm:px-8 md:px-0 pb-8'>
							<div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 hover:bg-white/15 transition-all duration-300 border border-white/5 flex flex-col h-full'>
								<div>
									<div className='flex items-center gap-3 mb-4'>
										<div className='p-2 rounded-lg bg-white/10'>
											<svg xmlns="http://www.w3.org/2000/svg" className="w-5 sm:w-6 h-5 sm:h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
											</svg>
										</div>
										<h3 className='text-lg sm:text-xl font-semibold text-white'>Open Source</h3>
									</div>
									<p className='text-white/70 text-sm leading-relaxed flex-grow'>Free and open source. Contribute to the project, suggest features, or use it in your own projects. Available on GitHub.</p>
								</div>
								<div className='mt-auto pt-4'>
									<div className='flex items-center gap-2'>
										<div className='flex items-center gap-1'>
											<span className='bg-white/10 text-white/90 px-3 py-1 rounded-full text-sm'>MIT License</span>
										</div>
									</div>
								</div>
							</div>

							<div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 hover:bg-white/15 transition-all duration-300 border border-white/5 flex flex-col h-full'>
								<div>
									<div className='flex items-center gap-3 mb-4'>
										<div className='p-2 rounded-lg bg-white/10'>
											<svg xmlns="http://www.w3.org/2000/svg" className="w-5 sm:w-6 h-5 sm:h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
											</svg>
										</div>
										<div className='flex w-full justify-between items-center'>
											<h3 className='text-lg sm:text-xl font-semibold text-white'>CLI Tool</h3>
											<a 
												href="https://www.npmjs.com/package/dbdraw" 
												target="_blank" 
												className="text-[#9D8CFF] hover:text-[#9D8CFF]/80 transition-colors flex items-center gap-1.5 text-sm"
											>
												<span>View Docs</span>
												<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
													<path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
												</svg>
											</a>
										</div>
									</div>
									<p className='text-white/70 text-sm leading-relaxed flex-grow'>Sync your database schema directly with your codebase using simple terminal commands.</p>
								</div>
								<div className='mt-auto pt-4'>
									<div className='flex flex-col gap-3'>
										<div className='bg-[#9D8CFF]/5 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between'>
											<div className='flex items-center gap-2 justify-between w-full relative'>
												<span className='text-[#9D8CFF] font-mono select-all'>npm i dbdraw</span>
												<button
													className='text-white/60 hover:text-white/90 transition-colors'
													onClick={() => {
														navigator.clipboard.writeText('npm i dbdraw');
														toast.success('Copied to clipboard');
													}}
												>
													<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
														<path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
													</svg>
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 hover:bg-white/15 transition-all duration-300 border border-white/5 flex flex-col h-full'>
								<div>
									<div className='flex items-center gap-3 mb-4'>
										<div className='p-2 rounded-lg bg-white/10'>
											<svg xmlns="http://www.w3.org/2000/svg" className="w-5 sm:w-6 h-5 sm:h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
											</svg>
										</div>
										<h3 className='text-lg sm:text-xl font-semibold text-white'>Templates</h3>
									</div>
									<p className='text-white/70 text-sm leading-relaxed flex-grow'>Start with our collection of pre-built database schemas and customize them to match your project needs.</p>
								</div>
								<div className='mt-auto pt-4'>
									<Link href="/templates" className='bg-[#9D8CFF]/5 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between group transition-colors hover:bg-[#9D8CFF]/10'>
										<div className='flex items-center gap-2'>
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-white/60 group-hover:text-white/90 transition-colors">
												<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z" />
											</svg>
											<span className='text-white/60 group-hover:text-white/90 transition-colors'>Browse Templates</span>
										</div>
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-white/60 group-hover:text-white/90 transition-colors">
											<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
										</svg>
									</Link>
								</div>
							</div>
						</div>
						<div className="w-full text-center text-white/40 text-sm mt-auto">
							<p>&copy; {new Date().getFullYear()} DBDraw - Built with &#10084;</p>
						</div>
					</div>
				</section>
			</div>
		</>
	)
}

export default Home