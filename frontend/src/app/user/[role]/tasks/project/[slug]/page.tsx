"use client";
import NotFound from "@/components/error/NotFound";
import PageLoading from "@/components/loader/PageLoading";
import { useGetProject, useGetProjectFromSlug } from "@/services/projectApi";
import { useGetProjectTask, useGetTaskById } from "@/services/taskApi";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Modal from "@/components/modal/Modal";
import { Delete, Edit, Eye, Trash, Trash2, X } from "lucide-react";
import TaskForm from "@/components/form/TaskForm";

import { Plus } from "lucide-react";
import { useTaskStore } from "@/hooks/useTaskStore";
import TaskCard from "@/components/card/TaskCard";
import { useCurrentUserStore } from "@/hooks/useCurrentUserStore";
const ProjectTask = () => {
	const { slug } = useParams();
	const [project, setProject] = useState<any>(null);
	const [openDropdown, setOpenDropdown] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const { currentUser } = useCurrentUserStore();
	const {
		data: taskData,
		isSuccess,
		isLoading,
		isError,
	} = useGetProjectTask(typeof slug == "string" ? slug : "");

	const [open, setOpen] = useState<boolean>(false);

	const { tasks, clearAllTasks, addAllTasks } = useTaskStore();

	useEffect(() => {
		if (isSuccess) {
			if (taskData) {
				setProject(taskData.project);
			}
		}
	}, [isSuccess, taskData]);

	useEffect(() => {
		if (
			taskData &&
			taskData.project.tasks.length !== 0 &&
			tasks.length == 0
		) {
			addAllTasks(taskData.project.tasks);
		}
	}, [clearAllTasks, taskData]);

	useEffect(() => {
		setLoading(false);
	}, [addAllTasks]);
	useEffect(() => {
		if (tasks.length > 0) {
			const [task] = tasks;
			console.log(tasks);
			if (task.project) {
				console.log(task.project);
				console.log(task.project.slug);
				if (task.project.slug !== slug) {
					console.log("hello");
					clearAllTasks();
				}
			}
		}
	}, []);

	return (
		<>
			{isError && <NotFound />}
			{(isLoading || loading) && <></>}
			{isSuccess && project && (
				<div className='flex flex-col mt-24 items-center h-[80vh] overflow-auto pb-16'>
					<div className='flex justify-between w-11/12 mx-auto'>
						<h1 className='text-2xl text-slate-600 font-semibold font-sans'>
							{project.name}
						</h1>
						<button
							className='flex gap-1 bg-indigo-500 text-white rounded-md h-10 min-w-24 px-2 items-center shadow-lg'
							onClick={() => setOpen(true)}>
							<Plus></Plus>Add Task
						</button>
					</div>
					<hr className='border border-slate-300 h-[1px] bg-slate-300 w-11/12 mx-auto mt-1' />
					<div
						className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3   gap-5 w-11/12'
						id='taskContainer'>
						{loading ? (
							<PageLoading />
						) : tasks && tasks.length > 0 ? (
							currentUser.role == "admin" ? (
								tasks.map((task: any) => (
									<TaskCard
										key={task.id}
										data={task}
										open={
											openDropdown ===
											task.id
										} // Check if this task's dropdown is open
										setOpen={() =>
											setOpenDropdown(
												openDropdown ===
													task.id
													? null
													: task.id,
											)
										} // Toggle logic
									/>
								))
							) : (
								tasks &&
								tasks
									.filter(
										(task: any) =>
											task.assignee.some(
												(
													user: any,
												) =>
													user.id ==
													currentUser.id,
											) ||
											task.assigner
												.id ==
												currentUser.id,
									)
									.map((task: any) => (
										<TaskCard
											key={task.id}
											data={task}
											open={
												openDropdown ===
												task.id
											} // Check if this task's dropdown is open
											setOpen={() =>
												setOpenDropdown(
													openDropdown ===
														task.id
														? null
														: task.id,
												)
											} // Toggle logic
										/>
									))
							)
						) : (
							<p className='text-gray-500 text-center w-full'>
								No Task Found
							</p>
						)}
					</div>
					<Modal
						open={open}
						setOpen={setOpen}>
						<div className='w-full md:w-3/4 lg:w-1/2 bg-white mx-auto rounde-md p-3  rounded-md relative'>
							<>
								<X
									className='h-5 w-5 absolute top-2 end-2 text-slate-400'
									onClick={() =>
										setOpen(false)
									}></X>
								<TaskForm
									open={open}
									setOpen={setOpen}
									action='add'
									data={taskData}
									title='Add Task'
								/>
							</>
						</div>
					</Modal>
				</div>
			)}
		</>
	);
};

export default ProjectTask;
