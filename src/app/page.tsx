"use client"

import React from 'react'
import UserButton from "@/components/clerk-components/UserButton";
import { SignInButton, useUser } from "@clerk/nextjs";
import Link from 'next/link';
import Noise from '@/effects/Animations/Noise/Noise';
import Squares from '@/effects/Backgrounds/Squares/Squares';

const Home = () => {
	const user = useUser();
	return (
		<>
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
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
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
				<section className="relative z-10 flex items-center max-w-screen px-4 sm:px-8 md:px-0">
					<div className="flex items-center justify-around flex-col w-full">
						<h1 className="text-center font-bold text-4xl sm:text-5xl md:text-7xl text-white leading-tight sm:leading-[4.5rem] mt-8">Sketch Your Database,<br />Build Your Backend Faster</h1>
						<p className="mt-6 sm:mt-8 w-full sm:w-3/4 md:w-2/5 text-center text-white/60 font-normal px-4 sm:px-0">Welcome to the future of schema building! Our intuitive no-code platform empowers you to design, visualize, and customize your database schemas effortlessly.</p>
						{user.isSignedIn ? 
							<Link href="/board" className="mt-6 bg-blue-600 px-4 sm:px-6 py-2 sm:py-3 text-white text-sm rounded-md">Start Building</Link> : 
							<SignInButton mode="modal">
								<button className="mt-6 bg-blue-600 px-4 sm:px-6 py-2 sm:py-3 text-white text-sm rounded-md">Start Building</button>
							</SignInButton>
						}
						<div className='mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full sm:w-[90vw] md:w-[80vw] mx-auto px-4 sm:px-8 md:px-0'>
							<div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 hover:bg-white/15 transition-all duration-300 border border-white/5'>
								<div className='flex items-center gap-3 mb-4'>
									<div className='p-2 rounded-lg bg-white/10'>
										<svg xmlns="http://www.w3.org/2000/svg" className="w-5 sm:w-6 h-5 sm:h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
										</svg>
									</div>
									<h3 className='text-lg sm:text-xl font-semibold text-white'>Open Source</h3>
								</div>
								<p className='text-white/70 text-sm leading-relaxed'>Free and open source. Contribute to the project, suggest features, or use it in your own projects. Available on GitHub.</p>
								<div className='mt-4 flex items-center gap-2'>
									<div className='flex items-center gap-1'>
										<span className='bg-white/10 text-white/90 px-3 py-1 rounded-full text-sm'>MIT License</span>
									</div>
								</div>
							</div>

							<div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 hover:bg-white/15 transition-all duration-300 border border-white/5'>
								<div className='flex items-center gap-3 mb-4'>
									<div className='p-2 rounded-lg bg-white/10'>
										<svg xmlns="http://www.w3.org/2000/svg" className="w-5 sm:w-6 h-5 sm:h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
									</div>
									<h3 className='text-lg sm:text-xl font-semibold text-white'>CLI Tool</h3>
								</div>
								<p className='text-white/70 text-sm leading-relaxed'>Sync your database schema directly with your codebase using simple terminal commands. Available soon.</p>
								<div className='mt-4 flex items-center gap-2'>
									<div className='flex items-center gap-1'>
										<span className='bg-white/10 text-white/90 px-3 py-1 rounded-full text-sm'>Coming Soon</span>
									</div>
								</div>
							</div>

							<div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 hover:bg-white/15 transition-all duration-300 border border-white/5'>
								<div className='flex items-center gap-3 mb-4'>
									<div className='p-2 rounded-lg bg-white/10'>
										<svg xmlns="http://www.w3.org/2000/svg" className="w-5 sm:w-6 h-5 sm:h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
										</svg>
									</div>
									<h3 className='text-lg sm:text-xl font-semibold text-white'>Templates</h3>
								</div>
								<p className='text-white/70 text-sm leading-relaxed'>Start with pre-built database schemas and customize them to match your project needs. Save development time.</p>
								<div className='mt-4 flex items-center gap-2'>
									<div className='flex items-center gap-1'>
										<span className='bg-white/10 text-white/90 px-3 py-1 rounded-full text-sm'>Coming Soon</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			</div>
		</>
	)
}

export default Home