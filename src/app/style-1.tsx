"use client"

import UserButton from "@/components/clerk-components/UserButton";
import { SignInButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import Noise from "@/effects/Animations/Noise/Noise";
import Squares from "@/effects/Backgrounds/Squares/Squares";

export default function Home() {
  const user = useUser();
  return (
    <>
      <main className="max-w-screen relative gradient-bg min-h-screen overflow-x-hidden">

        <div className="flex h-full w-full absolute z-0 opacity-15">
          <Squares
            speed={0.1}
            squareSize={40}
            direction='diagonal' // up, down, left, right, diagonal
            borderColor='rgba(255,255,0,1)'
            hoverFillColor='#222'
          />
        </div>
        <div className="relative z-1 max-w-screen  min-h-screen overflow-x-hidden">
          {/* <div className="gradient-bg h-screen w-screen"></div> */}
          <nav className="flex items-center justify-between px-20 py-6 h-[80px]">
            <h1 className="w-[100px] text-2xl font-bold text-white">DBDraw</h1>
            <ul className="flex items-center gap-12 text-white/80">
              <li>Templates</li>
              <li>GitHub</li>
            </ul>
            <div className="w-[100px] flex justify-end">{user.isSignedIn ? <UserButton /> : <SignInButton mode="modal" ><button className="bg-blue-600 px-6 py-3 text-white text-sm rounded-md">Sign In</button></SignInButton>}</div>
          </nav>
          <section className="flex items-center max-w-screen h-[70vh]">
            <div className="flex items-center justify-around flex-col w-full">
              <h1 className="text-center font-normal text-6xl text-white leading-[4.5rem]">Build schemas in minutes<br />without writing any code</h1>
              <p className="mt-8 w-2/5 text-center text-white/60 font-normal">Welcome to the future of schema building! Our intuitive no-code platform empowers you to design, visualize, and customize your database schemas effortlessly.</p>
              {user.isSignedIn ? <Link href="/board" className="mt-6 bg-blue-600 px-6 py-3 text-white text-sm rounded-md">Start Building</Link> : <SignInButton mode="modal"><button className="mt-6 bg-blue-600 px-6 py-3 text-white text-sm rounded-md">Start Building</button></SignInButton>}
              <div className="h-[10vh]"></div>
            </div>
          </section>
          <div className="h-auto max-w-screen">
            <div className="border-2 border-white/5 m-auto bg-node justify-center rounded-xl shadow-xs shadow-white w-[80vw] flex flex-col">
              <div className="h-10 w-full px-6 flex items-center justify-between">
                <div className="flex gap-2 items-center w-[100px]">
                  <span className="h-3 w-3 rounded-full aspect-square bg-red-500"></span>
                  <span className="h-3 w-3 rounded-full aspect-square bg-yellow-500"></span>
                  <span className="h-3 w-3 rounded-full aspect-square bg-green-500"></span>
                </div>
                <div className="">

                </div>
                <div className="w-[100px]">
                  <img src="/mac-frame.svg" className="h-4" />
                </div>
              </div>
              <Image src="/homepage-image.png" alt="bg-image" height={1080} width={1920} draggable={false} className="select-none w-[80vw] h-[80vh] shadow-lg rounded-lg object-cover" />
            </div>
            <div className="flex flex-col items-center mt-8 w-full">
              <h1 className="text-5xl font-normal text-white">Schema made easy</h1>
              <div className="grid grid-cols-4 gap-6 w-[80vw] mt-6">
                <div className="duration-150 hover:border-white border border-white/10 bg-white/5 px-6 py-5 rounded-2xl">
                  <h3 className="text-white text-xl font-bold">Interactive Schema Design</h3>
                  <p className="text-white/70 mt-2 text-sm">Create and manage complex database schemas visually with drag-and-drop functionality. Easily add, edit, and link collections and fields to design your perfect database structure.</p>
                </div>
                <div className="duration-150 hover:border-white border border-white/10 bg-white/5 px-6 py-5 rounded-2xl">
                  <h3 className="text-white text-xl font-bold">Templates</h3>
                  <p className="text-white/70 mt-2 text-sm">Choose from a variety of professionally designed templates to quickly build your database schema. Perfect for saving time and starting with best practices.</p>
                </div>
                <div className="duration-150 hover:border-white border border-white/10 bg-white/5 px-6 py-5 rounded-2xl">
                  <h3 className="text-white text-xl font-bold">Import/Export</h3>
                  <p className="text-white/70 mt-2 text-sm">Seamlessly import database schemas using JSON files and export them directly to JSON or MongoDB. Simplify data migration and integration with just a few clicks.</p>
                </div>
                <div className="duration-150 hover:border-white border border-white/10 bg-white/5 px-6 py-5 rounded-2xl">
                  <h3 className="text-white text-xl font-bold">Schema Notes</h3>
                  <p className="text-white/70 mt-2 text-sm">Add personal notes or to-do items directly to your schema for better organization. Keep track of ideas, reminders, or changes to avoid confusion during development.</p>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <footer className="w-full bg-white/10 mt-12 py-4 text-center text-white">
            Made with ❤️ by <a className="font-semibold" href="https://mrudulkolambe.vercel.app" target="_blank">mrudul</a>
          </footer>
        </div>
      </main>
    </>
  );
}
