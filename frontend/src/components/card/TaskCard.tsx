"use client";

import { timeElapsed } from "@/utils/formatter";
import { Edit, EllipsisVertical, Eye, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import Alert from "../modal/alert/Alert";
import Modal from "../modal/Modal";
import TaskForm from "../form/TaskForm";
import ViewTask from "../modal/view/ViewTask";
import { useMutation } from "@tanstack/react-query";
import { deleteTask } from "@/services/taskApi";
import { useTaskStore } from "@/hooks/useTaskStore";
import { useCurrentUserStore } from "@/hooks/useCurrentUserStore";
type Props = {
	data: any;
	open: boolean;
	setOpen: (state: boolean) => void;
};
const TaskCard: React.FC<Props> = ({ data: task, open, setOpen }) => {
	const [openEditTaskModal, setOpenEditTaskModal] =
		useState<boolean>(false);
	const [openViewModal, setOpenViewModal] = useState<boolean>(false);
	const [openViewTaskModal, setOpenViewTaskModal] =
		useState<boolean>(false);
	const [alert, setAlert] = useState<boolean>(false);
	const [message, setMessage] = useState<string>("");
	const [openMessage, setOpenMessage] = useState<boolean>(false);
	const { deleteTask: removeTask } = useTaskStore();
	const {
		mutate: deleteTaskMutation,
		isError: deleteTaskError,
		isSuccess: deleteTaskSuccess,
		isPending: pendingDelete,
	} = useMutation({
		mutationFn: deleteTask,
		onSuccess: (data) => {
			console.log(data);
			removeTask(data.task.id);
			setOpenMessage(true);
			setMessage("Task Deleted Successfully");
		},
		onError: (err) => {
			setOpenMessage(true);
			setMessage(err.message);
		},
	});

	const { currentUser } = useCurrentUserStore();
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

	const handleDelete = () => {
		deleteTaskMutation(task.id);
	};

	const handleDropdown = () => {
		setOpen(false);
		setOpenViewModal(true);
	};

	useEffect(() => {
		if (openMessage) {
			setTimeout(() => {
				setMessage("");
				setOpenMessage(false);
			}, 2000);
		}
	}, [openMessage]);

	return (
		<>
			<div className='relative w-full min-h-40 border border-slate-200 rounded-md shadow-md shadow-slate-200 mt-3 p-3 flex flex-col justify-between'>
				{/* Title & Dropdown */}
				<div className='flex justify-between items-center'>
					<p className='font-medium text-slate-700'>
						{task.title}
					</p>
					<div className='relative'>
						<EllipsisVertical
							className='text-slate-700 size-5 cursor-pointer hover:text-gray-500 transition'
							onClick={() => setOpen(!open)}
						/>
						{open && (
							<div className='absolute right-0 mt-2 min-w-28  bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-auto max-h-48'>
								<ul className='flex flex-col '>
									<li
										className='flex gap-1 items-center px-4 py-1 hover:bg-sky-200 cursor-pointer text-sky-500'
										onClick={
											handleDropdown
										}>
										<Eye className='size-5 text-sky-400' />
										View
									</li>
									{(currentUser.role ==
										"admin" ||
										currentUser.username ==
											task.assigner
												.username) && (
										<>
											<li
												className=' flex gap-1 items-center px-4 py-1 hover:bg-emerald-200 cursor-pointer text-emerald-500'
												onClick={() => {
													setOpen(
														false,
													);
													setOpenEditTaskModal(
														true,
													);
												}}>
												<Edit className='size-5 text-emerald-400' />
												Edit
											</li>
											<li
												className=' flex gap-1 items-center px-4 py-1 hover:bg-red-200 cursor-pointer text-red-500'
												onClick={() => {
													setOpen(
														false,
													);
													setAlert(
														true,
													);
												}}>
												<Trash2 className='size-5 text-red-500' />
												Delete
											</li>
										</>
									)}
								</ul>
							</div>
						)}
					</div>
				</div>

				{/* Description */}
				<p className='text-slate-500 text-sm truncate'>
					{task.description || "No Description Available"}
				</p>

				{/* Status & Priority */}
				<div className='flex gap-2 items-center mt-2'>
					<span
						className={`px-3 py-1 rounded-full text-white text-sm shadow text-nowrap ${
							taskStatus[`${task.status}`]
								.statusBackground
						}`}>
						{taskStatus[`${task.status}`].text}
					</span>
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
					<p className='text-xs text-gray-400 ml-auto text-nowrap'>
						{timeElapsed(task.createdAt)}
					</p>
				</div>
			</div>

			<Modal
				open={openEditTaskModal}
				setOpen={setOpenEditTaskModal}>
				<div className='w-full md:w-3/4 lg:w-1/2 bg-white mx-auto rounde-md p-3  rounded-md relative'>
					<>
						<X
							className='h-5 w-5 absolute top-2 end-2 text-slate-400'
							onClick={() =>
								setOpenEditTaskModal(false)
							}></X>
						<TaskForm
							open={openEditTaskModal}
							setOpen={setOpenEditTaskModal}
							action='edit'
							data={task}
							title='Edit Task'
						/>
					</>
				</div>
			</Modal>
			<Modal
				open={alert}
				setOpen={setAlert}>
				<Alert
					open={alert}
					title='Delete'
					isError={deleteTaskError}
					isSuccess={deleteTaskSuccess}
					errMessage={message}
					successMessage={message}
					isLoading={pendingDelete}
					setOpen={setAlert}
					message='Are you sure to delete task ?'
					positiveAction={() => handleDelete()}
					negativeAction={() => setAlert(false)}
				/>
			</Modal>

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

export default TaskCard;
