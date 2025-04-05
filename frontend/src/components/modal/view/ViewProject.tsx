"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

type Props = {
	setOpen: (state: boolean) => void;
	data: any;
	open: boolean;
};

const ViewProject: React.FC<Props> = ({ data, open, setOpen }) => {
	// Function to convert status to string
	const getStatusLabel = (status: number) => {
		switch (status) {
			case 0:
				return "Not Started";
			case 1:
				return "In Progress";
			case 2:
				return "Completed";
			case 3:
				return "Archived";
			case 4:
				return "Incomplete";
			default:
				return "Unknown";
		}
	};

	useEffect(() => {
		console.log(data);
	}, [data]);
	return (
		<div className='bg-white rounded-md border shadow-lg p-6 w-full md:w-2/3 lg:w-1/2 xl:w-1/3 flex flex-col gap-4 relative mx-auto'>
			<X
				className='absolute top-2 right-2 text-slate-500 cursor-pointer'
				onClick={() => setOpen(false)}
			/>

			<h2 className='text-2xl font-semibold'>{data.name}</h2>

			{/* Client Name */}
			<div className='flex items-center gap-2'>
				<span className='font-semibold'>Client:</span>
				<span>{data.client}</span>
			</div>

			{/* Project Status */}
			<div className='flex items-center gap-2'>
				<span className='font-semibold'>Status:</span>
				<span
					className={`px-3 py-1 rounded-md ${
						data.status === 2
							? "bg-green-500 text-white"
							: data.status === 1
							? "bg-blue-500 text-white"
							: data.status === 3
							? "bg-gray-400 text-white"
							: data.status === 4
							? "bg-red-500 text-white"
							: "bg-yellow-500 text-white"
					}`}>
					{getStatusLabel(data.status)}
				</span>
			</div>

			{/* Start and End Dates */}
			<div className='flex gap-4'>
				<div className='flex items-center gap-2'>
					<span className='font-semibold'>Start Date:</span>
					<span>
						{new Date(
							data.startDate,
						).toLocaleDateString()}
					</span>
				</div>
				<div className='flex items-center gap-2'>
					<span className='font-semibold'>End Date:</span>
					<span>
						{data.deadline
							? new Date(
									data.deadline,
							  ).toLocaleDateString()
							: "None"}
					</span>
				</div>
			</div>

			{/* Tags Section */}
			<div className='flex gap-2'>
				<span className='font-semibold'>Tags:</span>
				<div className='flex flex-wrap items-center gap-2'>
					{data.tags.length !== 0 ? (
						data.tags.map((tag: any) => (
							<span
								key={tag.name}
								className='bg-gray-200 px-3 py-1 rounded-md text-sm text-gray-700'>
								{tag.name}
							</span>
						))
					) : (
						<span className='text-sm text-slate-500'>
							No Tags
						</span>
					)}
				</div>
			</div>

			{/* Members Section */}
			<div>
				<span className='font-semibold'>Members:</span>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-2'>
					{data.members.map((member: any) => (
						<div
							key={member.id}
							className='flex items-center gap-4'>
							<img
								src={`${process.env.NEXT_PUBLIC_SERVER_URL}/uploads/user/${member.profilePhoto}`}
								alt={member.name}
								className='w-12 h-12 rounded-full object-cover'
							/>
							<div>
								<h3 className='font-semibold'>
									{member.name}
								</h3>
								<p className='text-sm text-gray-600'>
									{member.jobRole}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default ViewProject;
