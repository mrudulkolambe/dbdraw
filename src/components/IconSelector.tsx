// @ts-nocheck
import React, { useEffect, useState } from "react";
import * as LuReactIcons from "react-icons/lu";
import { twMerge } from "tailwind-merge";
import DynamicReactIcons from "./DynamicIcons";

const IconSelector = ({ icon, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [icons, setIcons] = useState([]);
  const [search, setSearch] = useState("");
  useEffect(() => {
    if (LuReactIcons) {
      setIcons(Object.keys(LuReactIcons));
    }
  }, [])

  return (
    <>
      <div className="relative">
        <div className="input flex items-center gap-3 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <DynamicReactIcons iconName={icon} /> {icon}
        </div>
        {isOpen && <div className="flex p-4 flex-col gap-4 rounded-lg border border-white/10 w-full  h-[40vh] absolute bg-secondary/20 backdrop-blur shadow-lg bottom-14">
          <input onChange={(e) => setSearch(e.target.value)} className="input" placeholder="Search icons..." />
          <div className="w-full grid grid-cols-6 overflow-auto gap-4 h-full justify-items-center">
            {
              icons.filter((item) => item.toLowerCase().includes(search.toLowerCase())).map((iconName, index) => {
                return <span onClick={() => {
                  onSelect(iconName)
                  setIsOpen(false)
                }} className={twMerge("h-max w-maxborder border-transparent flex items-center justify-center p-3 bg-white/5 rounded-lg", iconName === icon && "bg-blue-600/5 border-blue-600")}>
                  <DynamicReactIcons iconName={iconName}/>
                </span>
              })
            }
          </div>

        </div>}
      </div>
    </>
  )
}

export default IconSelector