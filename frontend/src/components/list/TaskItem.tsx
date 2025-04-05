"use client";

import React, { useState } from "react";
import { Eye } from "lucide-react";
import Modal from "../modal/Modal";
import ViewTask from "../modal/view/ViewTask";

type Props = {
	task: any;
};
const TaskItem: React.FC<Props> = ({ task }) => {
	const [openViewModal, setOpenViewModal] = useState<boolean>(false);
	const taskStatus = {
		"0": { text: "Not Started", statusBackground: "bg-red-500" },
		"1": { text: "Completed", statusBackground: "bg-emerald-400" },
		"2": { text: "In Progress", statusBackground: "bg-indigo-500" },
		"3": { text: "Incomplete", statusBackground: "bg-yellow-500" },
	} as any;

	const taskPriorityStatus = {
		"0": { text: "Low", statusBackground: "bg-green-400" },
		"3": { text: "Medium", statusBackground: "bg-blue-400" },
		"2": { text: "High", statusBackground: "bg-orange-500" },
		"1": { text: "Urgent", statusBackground: "bg-red-500" },
	} as any;

	return (
		<>
			<div className='flex items-center justify-between gap-2 w-full bg-slate-100 rounded-md p-2 shadow shadow-slate-500'>
				<img
					src={
						task.assigner.profilePhoto
							? `${process.env.NEXT_PUBLIC_SERVER_URL}/uploads/user/${task.assigner.profilePhoto}`
							: "/images/user.png"
					}
					className='h-10 w-10 rounded-full shadow bg-slate-300'
				/>
				<span className='text-slate-800 text-sm'>
					{task.title}
				</span>
				<div className='flex gap-2 items-center '>
					{/* <span
						className={`px-3 py-1 rounded-full text-white text-sm shadow text-nowrap ${
							taskStatus[`${task.status}`]
								.statusBackground
						}`}>
						{taskStatus[`${task.status}`].text}
					</span> */}
					<span
						className={`px-3 py-1 rounded-full text-white text-sm shadow text-nowrap ${
							taskPriorityStatus[`${task.priority}`]
								.statusBackground
						}`}>
						{
							taskPriorityStatus[`${task.priority}`]
								.text
						}
					</span>
					<Eye
						className='size-6 text-sky-400'
						onClick={() => setOpenViewModal(true)}
					/>
				</div>
			</div>

			<Modal
				open={openViewModal}
				setOpen={setOpenViewModal}>
				<ViewTask
					setOpen={setOpenViewModal}
					task={task}
				/>
			</Modal>
		</>
	);
};

export default TaskItem;
