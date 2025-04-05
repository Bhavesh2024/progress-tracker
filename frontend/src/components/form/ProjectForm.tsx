"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFormik } from "formik";
import { Project } from "@/interface/project";
import * as Yup from "yup";
import { projectDataPattern } from "@/utils/pattern";
import { jobRoleList, userRoleList } from "@/app/data/input";
import { Tag, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
// import { addUser, editProject } from "@/services/userApi";
import { addProject, updateProject } from "@/services/projectApi";
import MessageModal from "../modal/message/MessageModal";
import { useProjectStore } from "@/hooks/useProjectStore";
import Select from "react-select";
// import ReactTagInput from "react-tag-input-component";
import TagInput from "../input/TagInput";
import { useGetAllUser, useGetUsersForProject } from "@/services/userApi";
import ResponseModal from "../modal/response/ResponseModal";
import Modal from "../modal/Modal";
import { MultiSelect } from "primereact/multiselect";

type Props = {
	open: boolean;
	setOpen: (state: boolean) => void;
	formTitle: string;
	data: any;
	action: string;
};

type OptionType = { value: string; label: string };
const ProjectForm: React.FC<Props> = ({ setOpen, formTitle, data, action }) => {
	console.log(data);
	const [tags, setTags] = useState<string[]>([]);
	const [message, setMessage] = useState<string>("");
	const [openMessage, setOpenMessage] = useState<boolean>(false);
	const [options, setOptions] = useState<OptionType[]>([]);
	const [memberOption, setMemberOptions] = useState<OptionType[]>([]);
	const [selectedMembers, setSelectedMembers] = useState<any>(null);
	const {
		data: usersForProject,
		isError: projectUsersError,
		isSuccess: projectUsersSuccess,
		isPending: pendingProjectUsers,
	} = useGetUsersForProject();

	const { addNewProject, editProject } = useProjectStore();

	const {
		mutate: addProjectMutate,
		isError,
		isPending,
		isSuccess: addSuccess,
	} = useMutation({
		mutationFn: addProject,
		onSuccess: (data) => {
			setMessage(data.message);
			setOpenMessage(true);
			if (data) {
				addNewProject(data.project);
			}
		},
		onError: (err) => {
			setMessage(err.message);
			setOpenMessage(true);
		},
	});

	const {
		mutate: updateMutation,
		isPending: updatePending,
		isError: updateError,
		isSuccess: updateSuccess,
	} = useMutation({
		mutationFn: updateProject,
		onSuccess: (data: any) => {
			setMessage(data.message);
			setOpenMessage(true);
			editProject(data.project);
		},
		onError: (err) => {
			setMessage(data.message);
			setOpenMessage(true);
		},
	});

	const { name } = projectDataPattern;
	const formik = useFormik<Project>({
		initialValues: {
			id: "",
			name: "",
			status: 0,
			client: "",
			tags: [],
			startDate: "",
			deadline: "",
			members: [],
		},
		validationSchema: Yup.object({
			name: Yup.string()
				.required("Project Name is required")
				.matches(name, "Project Name is not in valid format "),
			startDate: Yup.string()
				.required("Start Date is required")
				.test("valid-date", "Invalid date format", (value) => {
					return !isNaN(Date.parse(value || ""));
				}),
			members: Yup.array().min(1, "Atleast one Member Required"),
		}),
		onSubmit: async (data) => {
			try {
				console.log("Data : ", { ...data, tags: tags });
				console.log("dgdgdfdhddf");
				action == "add"
					? addProjectMutate({ ...data, tags: tags })
					: updateMutation({ ...data, tags: tags });
			} catch (err) {
				if (err instanceof Error) {
					console.log(err.message);
				}
			}
		},
		validateOnMount: false,
		validateOnChange: false,
		validateOnBlur: true,
	});

	useEffect(() => {
		if (data) {
			const projectMembers = data.members.map((member: any) => ({
				label: member.name,
				value: member.username,
				image: member.profilePhoto,
			}));
			setSelectedMembers(
				projectMembers.map((member: any) => member.value),
			);
			formik.setValues({
				name: data.name || "",
				startDate: data.startDate
					? data.startDate.split("T")[0]
					: "",
				deadline: data.deadline
					? data.deadline.split("T")[0]
					: "",
				client: data.client,
				id: data.id,
				members: projectMembers,
				tags: data.tags,
				status: data.status,
			});
		}
	}, [data]);

	useEffect(() => {
		setTimeout(() => {
			setOpenMessage(false);
			setMessage("");
			if (addSuccess || updateSuccess) {
				setOpen(false);
			}
		}, 2000);
	}, [openMessage]);

	useEffect(() => {
		if (formik.values.tags.length !== 0) {
			// formik.values.tags.forEach((tag: any, index) =>
			// 	setTags([...tags, tag.name]),
			// );
			const projectTags = formik.values.tags.map((tag) => tag.name);
			setTags(projectTags);
		}
	}, [formik.values.tags]);
	useEffect(() => {
		if (projectUsersSuccess) {
			if (usersForProject) {
				const members = usersForProject.projectUsers;
				if (Array.isArray(members) && members.length !== 0) {
					console.log("hello");
					console.log("My Members :- ", members);
					setOptions(
						members.map((user: any) => ({
							value: user.username,
							label: user.name,
							image: user.profilePhoto,
						})),
					);
				}
			}
		}
	}, [projectUsersSuccess, usersForProject]);

	useEffect(() => {
		console.log(options);
	}, [options]);
	useEffect(() => {
		console.log("selected", selectedMembers);
		formik.setFieldValue(
			"members",
			options.filter((user: any) =>
				selectedMembers.includes(user.value),
			),
		);
		console.log(
			"selected members",
			options.filter((user: any) =>
				selectedMembers.includes(user.value),
			),
		);
	}, [selectedMembers]);

	return (
		<>
			<div className='flex w-full md:w-2/3 lg:w-1/2 xl:w-1/2 bg-white rounded-md shadow p-3 mx-auto  relative'>
				<form
					className='w-full flex flex-col gap-3 justify-center h-fit relative'
					onSubmit={formik.handleSubmit}>
					<div className='flex justify-center w-full mt-3'>
						{/* <MessageModal
							open={openMessage}
							message={message}
							isError={updateError || isError}
							isPending={updatePending || isPending}
						/> */}
						<Modal
							open={openMessage}
							setOpen={setOpenMessage}>
							<ResponseModal
								open={openMessage}
								message={message}
								isSuccess={
									updateSuccess ||
									addSuccess
								}
								isError={projectUsersError}
								isLoading={pendingProjectUsers}
								setOpen={setOpenMessage}
							/>
						</Modal>
					</div>
					<div className='relative top-0 w-full  mx-auto flex items-center  justify-center font-semibold text-3xl'>
						{formTitle}
					</div>
					<X
						className='absolute top-2 end-2 text-slate-500'
						onClick={() => setOpen(false)}
					/>
					<div className='flex flex-col gap-2 items-center w-full'></div>

					<div className={`grid grid-cols-1 `}>
						<div className='flex flex-col'>
							<label className='flex text-sm ps-1'>
								Project Name{""}
								<span className='text-lg -mt-1 text-red-400'>
									*
								</span>
							</label>
							<input
								type='text'
								name='name'
								placeholder='Project Name'
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.name}
								className={`border h-10 w-full  px-2  rounded-md  placeholder:text-sm${
									formik.errors.name
										? " border-red-500 focus:outline-red-500 placeholder:text-red-400"
										: " border-slate-300 "
								}`}
							/>
							{formik.errors.name && (
								<p className='text-red-400 text-xs px-2 mt-1'>
									{formik.errors.name}
								</p>
							)}
						</div>
					</div>

					<div className={`grid grid-cols-1`}>
						<div className='flex flex-col'>
							<label className='flex text-sm ps-1'>
								Client{""}
								<span className='text-lg -mt-1 text-red-400'>
									*
								</span>
							</label>
							<input
								type='text'
								name='client'
								placeholder='Client or Company'
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.client}
								className={`border h-10 w-full  px-2  rounded-md  placeholder:text-sm${
									formik.errors.client
										? " border-red-500 focus:outline-red-500 placeholder:text-red-400"
										: " border-slate-300 "
								}`}
							/>
							{formik.errors.client && (
								<p className='text-red-400 text-xs px-2 mt-1'>
									{formik.errors.client}
								</p>
							)}
						</div>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 mt-1 gap-2'>
						<div className='flex flex-col '>
							<label className='flex text-sm ps-1'>
								Start Date{""}
								<span className='text-lg -mt-1 text-red-400'>
									*
								</span>
							</label>
							<input
								type='date'
								name='startDate'
								placeholder='Start Date'
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={
									formik.values.startDate
										? new Date(
												formik.values.startDate,
										  )
												.toISOString()
												.split(
													"T",
												)[0]
										: ""
								}
								className={`border h-10 w-full  px-2  rounded-md  placeholder:text-sm${
									formik.errors.startDate
										? " border-red-500 focus:outline-red-500 placeholder:text-red-400"
										: " border-slate-300 "
								}`}
							/>
							{formik.errors.startDate && (
								<p className='text-red-400 text-xs px-2 mt-1'>
									{formik.errors.startDate}
								</p>
							)}
						</div>
						<div className='flex flex-col justify-start'>
							<label className='flex text-sm ps-1'>
								End Date
							</label>
							<input
								type='date'
								name='deadline'
								placeholder='End Date'
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={
									formik.values.deadline
										? new Date(
												formik.values.deadline,
										  )
												.toISOString()
												.split(
													"T",
												)[0]
										: ""
								}
								className={`border mt-1 h-10 w-full  px-2  rounded-md  placeholder:text-sm${
									formik.errors.deadline
										? " border-red-500 focus:outline-red-500 placeholder:text-red-400"
										: " border-slate-300 "
								}`}
							/>
							{formik.errors.deadline && (
								<p className='text-red-400 text-xs px-2 mt-1'>
									{formik.errors.deadline}
								</p>
							)}
						</div>
					</div>
					{/* {formik.values.members &&
						formik.values.members.map((member: any) => (
							<span>{member.username}</span>
						))} */}
					{/* <div className='flex flex-col'>
						<label className='flex text-sm gap-1 my-1   items-center'>
							Members
						</label>

						{action == "add" ? (
							<Select
								id='members'
								name='members'
								isMulti
								options={options}
								onChange={(
									selectedMembers: any,
								) => {
									formik.setFieldValue(
										"members",
										selectedMembers,
									); // Store only the usernames
								}}
							/>
						) : (
							<Select
								id='members'
								name='members'
								isMulti
								options={options}
								value={
									formik.values.members
										.length !== 0 &&
									formik.values.members.map(
										(member: any) => {
											return options.find(
												(
													option: OptionType,
												) =>
													option.value ===
													member.value,
											);
										},
									)
								}
								onChange={(
									selectedMembers: any,
								) => {
									formik.setFieldValue(
										"members",
										selectedMembers,
									);
								}}
							/>
						)}
					</div> */}
					<div className='flex flex-col'>
						<label className='flex text-sm gap-1 my-1   items-center'>
							Members
						</label>
						<MultiSelect
							value={selectedMembers}
							optionLabel='label'
							options={options}
							optionValue='value'
							placeholder='Select Members'
							onChange={(e) =>
								setSelectedMembers(e.value)
							}
							filter
							itemTemplate={(option) => (
								<div className='flex gap-1 items-center'>
									<img
										src={
											option.image !==
											""
												? `${process.env.NEXT_PUBLIC_SERVER_URL}/uploads/user/${option.image}`
												: "/images/user.png"
										}
										className='size-6 rounded-full bg-slate-300'
									/>
									{option.label}
								</div>
							)}
						/>
					</div>
					<div className='flex flex-col'>
						<label className='flex text-sm gap-1 p-0 -mb-2 items-center'>
							<Tag className='size-4 rotate-90' />
							<span className='mb-1'>Tags</span>
						</label>
						<TagInput
							tags={tags}
							setTags={setTags}
						/>
					</div>

					<div className='w-full flex flex-col gap-1 '>
						<label className='text-sm text-black ps-1'>
							Status
						</label>
						<select
							name='status'
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							defaultValue={0}
							value={formik.values.status}
							className={`border h-10 w-full  px-2  rounded-md  placeholder:text-sm${
								formik.errors.status
									? " border-red-500 focus:outline-red-500 placeholder:text-red-400 text-sm text-red-400"
									: " border-slate-300 "
							}`}>
							<div className='bg-emerald-300'>
								<option
									value={0}
									className='text-slate-900'>
									Not Started
								</option>
								<option
									value={1}
									className='text-slate-900'>
									In Progress
								</option>
								<option
									value={2}
									className='text-slate-900'>
									Completed
								</option>
								<option
									value={3}
									className='text-slate-900'>
									Archived
								</option>
								<option
									value={4}
									className='text-slate-900'>
									Incomplete
								</option>
							</div>
						</select>
						{formik.errors.status && (
							<p className='text-red-400 text-xs px-2 mt-1'>
								{formik.errors.status}
							</p>
						)}
					</div>

					<div className='flex justify-center'>
						<button
							type='submit'
							name='submit'
							className={`text-white h-10 rounded-full   mx-auto w-32 ${
								action
									? action == "add"
										? "bg-emerald-400"
										: "bg-blue-500"
									: "Submit"
							}`}>
							{action
								? action == "add"
									? "Add"
									: "Save"
								: "Submit"}
						</button>
					</div>
				</form>
			</div>
		</>
	);
};

export default ProjectForm;
