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
			<div className="bg-primary relative z-0 max-w-screen  min-h-screen overflow-x-hidden">
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

				<nav className="relative flex items-center justify-between px-20 py-6 h-[80px] z-10 bg-transparent">
					<h1 className="w-[100px] text-2xl font-bold text-white">DBDraw</h1>
					<ul className="flex items-center gap-12 text-white/80">
						<li>Templates</li>
						<li><a href="https://github.com/mrudulkolambe/dbdraw" target='_blank'>GitHub</a></li>
					</ul>
					<div className="w-[100px] flex justify-end">{user.isSignedIn ? <UserButton /> : <SignInButton mode="modal" ><button className="bg-blue-600 px-6 py-3 text-white text-sm rounded-md">Sign In</button></SignInButton>}</div>
				</nav>
				<section className="relative z-10 flex items-center max-w-screen">
					<div className="flex items-center justify-around flex-col w-full">
						<h1 className="text-center font-bold text-7xl text-white leading-[4.5rem]  mt-8">Sketch Your Database,<br />Build Your Backend Faster</h1>
						<p className="mt-8 w-2/5 text-center text-white/60 font-normal">Welcome to the future of schema building! Our intuitive no-code platform empowers you to design, visualize, and customize your database schemas effortlessly.</p>
						{user.isSignedIn ? <Link href="/board" className="mt-6 bg-blue-600 px-6 py-3 text-white text-sm rounded-md">Start Building</Link> : <SignInButton mode="modal"><button className="mt-6 bg-blue-600 px-6 py-3 text-white text-sm rounded-md">Start Building</button></SignInButton>}
						<div className='mt-10 grid grid-cols-3 gap-10 w-[80vw]'>
							<div className='bg-white/50 h-72 w-full'>
								<p>open source</p>
							</div>
							<div className='bg-white/50 h-72 w-full'>
								<p>cli available soon</p>
							</div>
							<div className='bg-white/50 h-72 w-full'>
								<p>templates soon</p>
							</div>
						</div>
					</div>
				</section>
			</div>
		</>
	)
}

export default Home