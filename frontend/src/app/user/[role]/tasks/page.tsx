"use client";

import ProjectCard from "@/components/card/ProjectCard";
import TaskForm from "@/components/form/TaskForm";
import PageLoading from "@/components/loader/PageLoading";
import Modal from "@/components/modal/Modal";
import { useGetMemberProject } from "@/services/taskApi";
import { Plus, X } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const TaskModule = () => {
	const { role } = useParams();
	const [open, setOpen] = useState<boolean>(false);
	const {
		data: userProjects,
		isSuccess,
		isLoading,
		isError,
	} = useGetMemberProject();

	// useEffect(() => {}, [user]);
	return (
		<>
			<div className='flex flex-col gap-3 items-center mt-24 h-screen pb-32 overflow-auto w-full'>
				<header className='flex w-11/12 justify-between items-center'>
					<div className='font-semibold text-xl font-sans text-slate-6s00'>
						Task
					</div>
					<div>
						<button
							className='flex gap-1 bg-indigo-500 text-white rounded-md h-10 min-w-24 px-2 items-center shadow-lg'
							onClick={() => setOpen(true)}>
							<Plus></Plus>Add Task
						</button>
					</div>
				</header>
				<hr className='border border-slate-300 h-[1px] bg-slate-300 w-11/12 mx-auto' />
				{/* <div></div> */}
				{/* <div className='flex '> */}
				{isLoading && <PageLoading />}
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-5  w-11/12'>
					{isSuccess &&
						userProjects.projects.map(
							(project: any) => (
								<ProjectCard
									title={project.name}
									destination={`/user/${role}/tasks/project/${project.slug}`}
									data={project}
								/>
							),
						)}
				</div>
				{isError && (
					<div className='flex justify-center items-center h-screen border w-11/12'>
						<h1 className='text-2xl text-slate-500 font-semibold'>
							No Project Found
						</h1>
					</div>
				)}
				{/* </div> */}
			</div>
			<Modal
				open={open}
				setOpen={setOpen}>
				<div className='w-full md:w-3/4 lg:w-1/2 bg-white mx-auto rounde-md p-3  rounded-md relative'>
					<>
						<X
							className='h-5 w-5 absolute top-2 end-2 text-slate-400'
							onClick={() => setOpen(false)}></X>
						{isSuccess && (
							<TaskForm
								open={open}
								setOpen={setOpen}
								action='add'
								data={userProjects}
								title='Add Task'
							/>
						)}
					</>
				</div>
			</Modal>
		</>
	);
};

export default TaskModule;
