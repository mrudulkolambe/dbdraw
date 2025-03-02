// @ts-nocheck

import React from "react";
import * as LuReactIcons from "react-icons/lu";

const DynamicReactIcons = ({iconName}:{iconName: string}) => {
	const DisplayIcons = () => {
	  return LuReactIcons[iconName];
	};
  
	return (
	  <span style={{ fontSize: "20px", margin: "" }}>
		{React.createElement(DisplayIcons())}
	  </span>
  
	);
  };

  
export default DynamicReactIcons;