"use client";

import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Delete, Edit, Eye, Loader, Loader2, Plus, Trash2 } from "lucide-react";
import ProjectForm from "@/components/form/ProjectForm";
import Alert from "@/components/modal/alert/Alert";
import Modal from "@/components/modal/Modal";
import { deleteProject, useGetAllProject } from "@/services/projectApi";
import dotenv from "dotenv";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import ViewProject from "@/components/modal/view/ViewProject";

import { useProjectStore } from "@/hooks/useProjectStore";
import { classNames } from "primereact/utils";
import Image from "next/image";
// import { deleteProject } from "@/services/projectApi";
// import { Project } from "@/interface/Project";
dotenv.config();

const Project = () => {
	const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
	const [openFormModal, setOpenFormModal] = useState<boolean>(false);
	const [formAction, setFormAction] = useState<string>("");
	const [id, setId] = useState<string>("");
	const [currentProject, setCurrentProject] = useState(null);
	const [searchValue, setSearchValue] = useState<string>("");
	const [openViewModal, setOpenViewModal] = useState<boolean>(false);
	const {
		projects,
		addNewProject,
		editProject,
		deleteProject: removeProject,
		clearAllProject,
	} = useProjectStore();
	// Mutation hook for deleting a Project
	const {
		mutate: deleteProjectMutation,
		isError: deleteError,
		isSuccess: deleteSuccess,
		isPending: pendingDelete,
	} = useMutation({
		mutationFn: deleteProject,
		onSuccess: (data) => {
			removeProject(data.id);
		},
		onError: (err) => {
			console.log(err.message);
		},
	});

	const {
		data: allProjects,
		isLoading: loadingProjects,
		isError: projectsError,
		isSuccess: projectsSuccess,
	} = useGetAllProject();
	const statusBackground = {
		0: "bg-red-500", // Not Started
		1: "bg-blue-500", // In Progress
		2: "bg-purple-500", // Completed
		3: "bg-green-500", // Archived
		4: "bg-yellow-500", // Incomplete
	} as any;

	const statusText = {
		0: "Not Started",
		1: "In Progress",
		2: "Completed",
		3: "Archived",
		4: "Incomplete",
	} as any;

	const handleDelete = (id: string) => {
		setId(id);
		setOpenDeleteModal(true);
	};

	const handleDeleteProject = async (id: string) => {
		try {
			deleteProjectMutation(id);
		} catch (err) {
			if (err instanceof Error) {
				console.log(err.message);
			}
		}
	};

	const handleFormModal = (
		action: string,
		id: string = "",
		data: any | null = null,
	) => {
		if (id !== "") {
			if (data !== null) {
				setCurrentProject(data);
			}

			formAction == "edit"
				? setOpenFormModal(true)
				: setFormAction("edit");
			setId(id);
		} else {
			setCurrentProject(null);
			formAction == "add"
				? setOpenFormModal(true)
				: setFormAction("add");
		}
	};

	const handleViewModal = (data: any) => {
		if (data) {
			setCurrentProject(data);
			setOpenViewModal(true);
		}
	};

	useEffect(() => {
		if (formAction == "add" || formAction == "edit") {
			setOpenFormModal(true);
		}
	}, [formAction]);

	useEffect(() => {
		if (projects.length == 0) {
			console.log(allProjects);
			if (allProjects && Array.isArray(allProjects.projects)) {
				allProjects.projects.forEach((project: any) => {
					addNewProject(project);
				});
			}
		}
	}, [allProjects]);

	useEffect(() => {
		return () => {
			// console.log("hello");
			clearAllProject();
		};
	}, []);

	return (
		<div className='flex flex-col gap-3 items-center justify-center h-screen w-full overflow-auto'>
			<div className='flex justify-between w-10/12 '>
				<h1 className='text-xl font-semibold font-sans'>
					Project
				</h1>
				<div className='flex flex-nowrap gap-3'>
					<input
						type='search'
						placeholder='Search Users..'
						className='border border-slate-300 rounded-md px-2 focus:outline-sky-200'
						onChange={(e) =>
							setSearchValue(e.target.value)
						}
					/>
					<button
						type='button'
						className='bg-sky-600 rounded-md shadow min-w-24 h-10 text-white flex items-center justify-center'
						onClick={() => handleFormModal("add")}>
						<Plus /> Add
					</button>
				</div>
			</div>

			<div className='w-10/12 overflow-hidden'>
				{/* ✅ Wrapper with proper scrolling */}
				<div className='overflow-x-auto'>
					<DataTable
						value={projects}
						className='text-nowrap'
						paginator
						rows={10}
						rowsPerPageOptions={[
							5, 10, 15, 20, 50, 100,
						]}
						globalFilter={searchValue}
						size='small'>
						<Column
							field='projectCode'
							alignHeader={"center"}
							header='Id'
							align={"center"}
							sortable></Column>
						<Column
							field='name'
							header='Project Name'
							sortable
							alignHeader={"center"}
							className='capitalize'
							align={"center"}></Column>
						<Column
							field='client'
							header='Client'
							alignHeader={"center"}
							className='capitalize'
							sortable
							align={"center"}>
							{" "}
						</Column>
						<Column
							field='startDate'
							header='Start Date'
							alignHeader={"center"}
							sortable
							align={"center"}
							body={(project) =>
								new Date(
									project.startDate,
								).toLocaleDateString()
							}></Column>
						<Column
							field='deadline'
							header='End Date'
							alignHeader={"center"}
							sortable
							align={"center"}
							body={(project) => (
								<span className='text-center'>
									{project.deadline
										? new Date(
												project.deadline,
										  ).toLocaleDateString()
										: "-"}
								</span>
							)}
							className='text-center'></Column>
						<Column
							header={"Members"}
							field='members'
							alignHeader={"center"}
							align={"center"}
							className='min-w-40'
							body={(data) => {
								const maxVisible = 3; // Max members to show before "+X more"
								const membersToShow =
									data.members.slice(
										0,
										maxVisible,
									);
								const extraCount =
									data.members.length -
									maxVisible;

								return (
									<div
										className={`text-center relative flex items-center`}>
										{membersToShow.map(
											(
												member: any,
												index: number,
											) => (
												<Image
													key={
														index
													}
													src={
														member.profilePhoto !==
														""
															? `${process.env.NEXT_PUBLIC_SERVER_URL}/uploads/user/${member.profilePhoto}`
															: "/images/user.png"
													}
													height={
														50
													}
													width={
														50
													}
													alt='Member'
													title={
														member.name
													}
													className={`h-10 w-10 rounded-full shadow absolute`}
													style={{
														left: `${
															index *
															22
														}px`, // Adjust spacing dynamically
														zIndex:
															membersToShow.length -
															index, // Ensures the last element is on top
													}}
												/>
											),
										)}
										{extraCount > 0 && (
											<div
												className='h-10 w-10 rounded-full shadow flex items-center justify-center bg-black/80 text-white absolute'
												style={{
													left: `${
														maxVisible *
														24
													}px`, // Position after last shown image
													zIndex: 0,
												}}>
												+
												{
													extraCount
												}
											</div>
										)}
									</div>
								);
							}}
						/>

						<Column
							header='Tags'
							field='tags'
							alignHeader={"center"}
							align={"center"}
							body={(project) => (
								<div className='px-4 text-center flex flex-wrap h-16 my-auto items-center gap-1 w-72 max-w-72'>
									{project.tags &&
									project.tags.length !== 0
										? project.tags.map(
												(
													tag: any,
												) => (
													<span className='bg-slate-200 py-1 px-3 rounded-md mt-1'>
														{
															tag.name
														}
													</span>
												),
										  )
										: "No tags"}
								</div>
							)}
							className='flex mx-auto'></Column>
						<Column
							header={"Status"}
							field='status'
							sortable
							align={"center"}
							alignHeader={"center"}
							body={(project: any) => (
								<span
									className={`px-2 py-2 rounded-md text-white text-sm ${
										statusBackground[
											`${project.status}`
										]
									}`}>
									{
										statusText[
											`${project.status}`
										]
									}
								</span>
							)}></Column>
						<Column
							body={(project) => (
								<Eye
									className='mx-auto  flex cursor-pointer text-sky-500 '
									onClick={() =>
										handleViewModal(
											project,
										)
									}
								/>
							)}
							header='View'></Column>
						<Column
							body={(project) => (
								<Edit
									className='mx-auto  flex cursor-pointer text-emerald-500 '
									onClick={() =>
										handleFormModal(
											"edit",
											project.id,
											project,
										)
									}
								/>
							)}
							header='Edit'></Column>
						<Column
							body={(project) => (
								<Trash2
									className='cursor-pointer text-red-500 mx-auto  flex '
									onClick={() =>
										handleDelete(
											project.id,
										)
									}
								/>
							)}
							header={"Delete"}></Column>
					</DataTable>
					{/* <table className='min-w-full border border-slate-400 table-auto min-h-32'>
						<thead className='border-b bg-gray-100 sticky top-0'>
							<tr>
								{tableColumn.map(
									(col, index) => (
										<th
											key={index}
											className='uppercase font-semibold font-sans py-3 px-4 text-center whitespace-nowrap'>
											{col}
										</th>
									),
								)}
							</tr>
						</thead>
						<tbody className='text-center relative'>
							{loadingProjects && (
								<div className='flex justify-center mx-auto absolute left-2/5 top-5'>
									<div className='w-full flex items-center text-slate-400'>
										<Loader2 className='size-10 text-emerald-400 animate-spin'></Loader2>{" "}
										Loading....
									</div>
								</div>
							)}
							{!loadingProjects &&
							projects.length !== 0 ? (
								projects.map(
									(
										project: any,
										index: number,
									) => (
										<tr
											className='border-b text-nowrap h-16 '
											key={`${project.id}`}>
											<td className='px-4 py-2 text-center'>
												{index +
													1}
											</td>
											<td className='px-4 py-2 text-center'>
												{
													project.name
												}
											</td>
											<td className='px-4 py-2 text-center'>
												{
													project.client
												}
											</td>
											<td className='px-4 text-center flex flex-wrap h-16 my-auto items-center gap-1 w-72 max-w-72'>
												{project.tags &&
												project
													.tags
													.length !==
													0
													? project.tags.map(
															(
																tag: any,
															) => (
																<span className='bg-slate-200 py-1 px-3 rounded-md mt-1'>
																	{
																		tag.name
																	}
																</span>
															),
													  )
													: "No tags"}
											</td>
											<td className='px-4 py-2 text-center relative'>
												{project.members &&
												project
													.members
													.length !==
													0
													? project.members.map(
															(
																member: any,
																index: number,
															) => (
																<img
																	key={
																		index
																	}
																	src={`${process.env.NEXT_PUBLIC_SERVER_URL}/uploads/user/${member.profilePhoto}`}
																	className={`h-10 w-10 rounded-full shadow absolute top-4 ${
																		index >
																		0
																			? "left-8"
																			: "left-0"
																	}`}
																	style={{
																		zIndex:
																			project
																				.members
																				.length -
																			index,
																	}} // To ensure the stacking order
																/>
															),
													  )
													: "No Members"}
											</td>

											<td className='px-4 py-2 text-center'>
												{
													project.startDate
												}
											</td>
											<td className='px-4 py-2 text-center'>
												{
													project.deadline
												}
											</td>
											<td className='px-4 py-2 text-center'>
												{
													project.status
												}
											</td>

											<td className='px-4 py-2 text-center'>
												<Eye
													className='inline-flex cursor-pointer text-sky-500 '
													onClick={() =>
														handleViewModal(
															project,
														)
													}
												/>
											</td>
											<td className='px-4 py-2 text-center'>
												<Edit
													className='inline-flex cursor-pointer text-green-400'
													onClick={() =>
														handleFormModal(
															"edit",
															project.id,
															project,
														)
													}
												/>
											</td>
											<td className='px-4 py-2 text-center'>
												<Trash2
													className='inline-flex cursor-pointer text-red-500'
													onClick={() =>
														handleDelete(
															project.id,
														)
													}
												/>
											</td>
										</tr>
									),
								)
							) : (
								<div className='flex justify-center mx-auto absolute left-2/5 top-5'>
									<div className='w-full flex items-center text-slate-700 text-2xl font-bold'>
										No Project Available
									</div>
								</div>
							)}
						</tbody>
					</table> */}
				</div>
			</div>

			{/* Delete Modal */}
			<Modal
				open={openDeleteModal}
				setOpen={setOpenDeleteModal}>
				<div className='min-h-[90vh] flex items-center justify-center'>
					<Alert
						open={openDeleteModal}
						title='Delete'
						setOpen={setOpenDeleteModal}
						message='Are You Sure to Delete Project ?'
						positiveAction={() =>
							handleDeleteProject(id)
						}
						isLoading={pendingDelete}
						isSuccess={deleteSuccess}
						isError={deleteError}
						successMessage='Project Deleted Successfully'
						errMessage='Project Not Deleted'
						// onError={deleteError}
					/>
				</div>
			</Modal>

			{/* Form Modal */}
			<Modal
				open={openFormModal}
				setOpen={setOpenFormModal}>
				<ProjectForm
					open={openFormModal}
					setOpen={setOpenFormModal}
					formTitle={
						formAction === "add"
							? "Add Project"
							: "Edit Project"
					}
					action={formAction}
					data={currentProject}
				/>
			</Modal>
			<Modal
				open={openViewModal}
				setOpen={setOpenViewModal}>
				<ViewProject
					setOpen={setOpenViewModal}
					open={openFormModal}
					data={currentProject}
				/>
			</Modal>
		</div>
	);
};

export default Project;
