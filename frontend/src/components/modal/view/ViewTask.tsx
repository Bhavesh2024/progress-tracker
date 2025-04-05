"use client";

import React from "react";
import { X } from "lucide-react";
type Props = {
	setOpen: (state: boolean) => void;
	task: any;
};
const ViewTask: React.FC<Props> = ({ setOpen, task }) => {
	return (
		<>
			<div className='flex flex-col w-11/12 md:w-1/2 lg:w-2/5 bg-white min-h-[80vh] rounded-md shadow relative p-6'>
				{/* Close Button */}
				<X
					className='text-slate-500 absolute top-3 end-3 cursor-pointer'
					onClick={() => setOpen(false)}
				/>

				{/* Task Title */}
				<h2 className='text-lg font-semibold text-slate-800'>
					{task.title}
				</h2>
				<p className='text-sm text-slate-500'>
					{task.description || "No description provided."}
				</p>

				{/* Status & Priority */}
				<div className='flex gap-2 mt-3'>
					<span
						className={`px-3 py-1 rounded-md text-white text-sm ${
							task.status === 0
								? "bg-red-500"
								: task.status === 1
								? "bg-emerald-400"
								: task.status === 2
								? "bg-indigo-500"
								: "bg-yellow-500"
						}`}>
						{
							[
								"Not Started",
								"Completed",
								"In Progress",
								"Incomplete",
							][task.status]
						}
					</span>
					<span
						className={`px-3 py-1 rounded-md text-white text-sm ${
							task.priority === 0
								? "bg-green-400"
								: task.priority === 1
								? "bg-red-500"
								: task.priority === 2
								? "bg-orange-500"
								: "bg-blue-400"
						}`}>
						{
							["Low", "Urgent", "High", "Medium"][
								task.priority
							]
						}
					</span>
				</div>

				{/* Project Details */}
				<div className='mt-4'>
					<h3 className='flex items-center gap-1 text-lg font-semibold text-slate-800'>
						Project :{" "}
						<span className='text-gray-600 text-lg font-medium'>
							{task.project.name}
						</span>
					</h3>
					<div className='flex flex-col items-start gap-3 mt-2'>
						<div className='flex gap-2 items-center flex-wrap'>
							{task.project.members.map(
								(member: any) => (
									<div className='flex flex-col gap-1 items-center'>
										<img
											src={`${
												member.profilePhoto !==
												""
													? `${process.env.NEXT_PUBLIC_SERVER_URL}/uploads/user/${member.profilePhoto}`
													: "/images/user.png"
											}`}
											className='rounded-full h-16 w-16 '
										/>
										<span className='text-slate-600 text-sm'>
											{member.name}
										</span>
									</div>
								),
							)}
						</div>
					</div>
				</div>

				{/* Assigner */}
				<div className='mt-4'>
					<h3 className='text-sm font-semibold text-slate-700'>
						Assigned By
					</h3>
					<div className='flex flex-col w-fit   gap-1 mt-2'>
						<img
							src={
								task.assigner.profilePhoto
									? `${process.env.NEXT_PUBLIC_SERVER_URL}/uploads/user/${task.assigner.profilePhoto}`
									: "/images/user.png"
							}
							alt={task.assigner.name}
							className='w-16 h-16 rounded-full object-cover'
						/>
						<p className='text-slate-600 text-sm'>
							{task.assigner.name}
						</p>
					</div>
				</div>

				{/* Assignee(s) */}
				<div className='mt-4'>
					<h3 className='text-sm font-semibold text-slate-700'>
						Assigned To
					</h3>
					<div className='flex flex-wrap gap-3 mt-2'>
						{task.assignee.map((user: any) => (
							<div
								key={user.id}
								className='flex flex-col  gap-1'>
								<img
									src={
										user.profilePhoto
											? `${process.env.NEXT_PUBLIC_SERVER_URL}/uploads/user/${user.profilePhoto}`
											: "/images/user.png"
									}
									alt={user.name}
									className='w-16 h-16 rounded-full object-cover'
								/>
								<p className='text-slate-600 text-sm'>
									{user.name}
								</p>
							</div>
						))}
					</div>
				</div>
				<div className='mt-4'>
					<div className='text-slate-600 text-sm flex flex-col gap-1'>
						<span className='text-sm font-semibold text-slate-700'>
							Tags{" "}
							<span className='text-slate-500 text-sm'>
								{task.tags.length == 0 &&
									": No Tags"}{" "}
							</span>
						</span>

						{task.tags.length !== 0 &&
							task.tags.map((tag: any) => (
								<span className='bg-slate-200 text-gray-900 rounded-md p-3 shadow w-fit'>
									{tag.name}
								</span>
							))}
					</div>
				</div>
			</div>
		</>
	);
};

export default ViewTask;
