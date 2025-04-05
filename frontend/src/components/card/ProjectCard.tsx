"use client";

import React from "react";
import { FolderOpenDot } from "lucide-react";
import Link from "next/link";
type Props = {
	title: string;
	data: any;
	destination: string;
};
const ProjectCard: React.FC<Props> = ({ title, destination = "" }) => {
	return (
		<>
			<Link href={destination}>
				<div className='h-40 w-full shadow-lg rounded-md bg-slate-100'>
					<div className='h-40 flex flex-col items-center justify-center text-slate-700'>
						<FolderOpenDot className='flex h-20 w-20' />
						<h5>{title || "Untitled"}</h5>
					</div>
				</div>
			</Link>
		</>
	);
};

export default ProjectCard;
