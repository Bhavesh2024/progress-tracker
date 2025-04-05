"use client";

import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { TaskDataFormat } from "@/interface/task";
import * as Yup from "yup";
import Select from "react-select";
import TagInput from "../input/TagInput";
import { Tag } from "lucide-react";

import { useMutation } from "@tanstack/react-query";
import { addTask, editTask } from "@/services/taskApi";
import { useTaskStore } from "@/hooks/useTaskStore";
import Modal from "../modal/Modal";
import ResponseModal from "../modal/response/ResponseModal";
import { useCurrentUserStore } from "@/hooks/useCurrentUserStore";
import { MultiSelect } from "primereact/multiselect";
import { io } from "socket.io-client";
import { Calendar } from "primereact/calendar";
type Props = {
	title: string;
	open: boolean;
	setOpen: (state: boolean) => void;
	action: string;
	data: any;
};

const socket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}`);

const TaskForm: React.FC<Props> = ({ title, open, setOpen, action, data }) => {
	const [tags, setTags] = useState<string[]>([]);
	const [memberOptions, setMemberOptions] = useState([]);
	const [projectOptions, setProjectOptions] = useState([]);

	const [selectedMembers, setSelectedMembers] = useState<any>(null);
	const [message, setMessage] = useState<string>("");

	const [openModal, setOpenModal] = useState<boolean>(false);
	const { currentUser } = useCurrentUserStore();
	const { addNewTask, editTask: updateTask } = useTaskStore();

	const {
		mutate: editTaskMutation,
		isPending: editTaskPending,
		isSuccess: editTaskSuccess,
		isError: editTaskError,
		isPending: pendingEdit,
	} = useMutation({
		mutationFn: editTask,
		onSuccess: (data: any) => {
			// addNewTask(data);
			setMessage("Task Updated Successfully");

			updateTask(data.task);
			setOpenModal(true);
			setTimeout(() => {
				setOpen(false);
			}, 2000);
		},
		onError: (err) => {
			setOpenModal(true);
			// console.log(err.);
			setMessage(err.message);
		},
	});

	const taskStatusOptions = [
		{
			label: "Not Started",
			value: 0,
		},
		{
			label: "Completed",
			value: 1,
		},
		{
			label: "In Progress",
			value: 2,
		},
		{
			label: "Incomplete",
			value: 3,
		},
	];

	const taskPriorityStatus = [
		{
			label: "Low",
			value: 0,
		},
		{
			label: "Medium",
			value: 3,
		},
		{
			label: "High",
			value: 2,
		},
		{
			label: "Urgent",
			value: 1,
		},
	];

	const {
		mutate: addTaskMutation,
		isPending: addTaskPending,
		isSuccess: addTaskSuccess,
		isError: addTaskError,
	} = useMutation({
		mutationFn: addTask,
		onSuccess: (data: any) => {
			// addNewTask(data);
			// socket.on('connect')
			// socket.on('connection',())
			setMessage("Task Added Successfully");
			addNewTask(data.task);
			setOpenModal(true);
			console.log(data);
			setTimeout(() => {
				setOpen(false);
			}, 2000);
			socket.emit("newTask", { task: data.task });
		},
		onError: (err) => {
			setOpenModal(true);
			// console.log(err.);
			setMessage(err.message);
		},
	});
	const formik = useFormik<TaskDataFormat>({
		initialValues: {
			taskId: action == "edit" ? data.id : 0,
			title: "",
			startDate: "",
			endDate: "",
			priority: 3,
			status: 0,
			assigner: currentUser.username,
			assignee: [],
			tags: [],
			project: "",
			description: "",
		},
		onSubmit: (data) => {
			console.log(data);
			try {
				action == "add"
					? addTaskMutation(data)
					: editTaskMutation(data);
			} catch (err) {
				if (err instanceof Error) {
					setOpenModal(true);
					setMessage(err.message);
				}
			}
		},

		validationSchema: Yup.object({
			title: Yup.string()
				.required("Title is required")
				.min(2, "Minimum Two Character Required")
				.matches(
					/^[a-zA-Z0-9\s]+$/,
					"Title should not contain special characters",
				),

			startDate: Yup.date().typeError(
				"Start Date must be a valid date",
			),
			endDate: Yup.date()
				.typeError("End Date must be a valid date")
				.min(
					Yup.ref("startDate"),
					"End Date must be after the Start Date",
				),

			assigner: Yup.string()
				.required("Assignee is required")
				.matches(
					/^[a-zA-Z0-9_]+$/,
					"Assignee name should not contain special characters",
				),

			assignee: Yup.array().of(Yup.string()).optional(),

			tags: Yup.array().of(Yup.string()).optional(),
			project: Yup.string().required("Project is required"),
			description: Yup.string().max(
				1000,
				"Description must be less than or equal to 1000 characters",
			),

			// Validate members conditionally
		}),
		validateOnBlur: true,
		validateOnMount: false,
		validateOnChange: true,
	});

	useEffect(() => {
		if (
			formik.values.project !== "" &&
			data.projects &&
			action == "add"
		) {
			const currentProjectMembers = data.projects
				.filter(
					(project: any) =>
						project.projectCode ==
						formik.values.project,
				)[0]
				.members.map((user: any) => ({
					label: user.name,
					value: user.username,
					image: user.profilePhoto,
				}));

			setMemberOptions(currentProjectMembers);
		}
	}, [currentUser, formik.values.project]);
	useEffect(() => {
		if (formik.values.project !== "") {
			if (action == "add" && data.projects) {
				const currentProject = data.projects.filter(
					(project: any) =>
						project.projectCode ==
						formik.values.project,
				);
				// console.log("i am reached hered");
				const assignee = currentProject[0].members.map(
					(member: any) => member.username,
				);
				formik.setFieldValue("assignee", assignee);
				setMemberOptions(
					currentProject[0].members.map((user: any) => ({
						label: user.name,
						value: user.username,
						image: user.profilePhoto,
					})),
				);
			}
			if (action == "edit") {
			}
		}
	}, [formik.values.project]);

	useEffect(() => {
		if (openModal) {
			setTimeout(() => {
				setOpenModal(false);
			}, 2000);
		}
	}, [openModal]);

	useEffect(() => {
		if (!data && action == "add") {
			// setProjectOptions();
			setProjectOptions(
				currentUser.projects.map((project: any) => ({
					value: project.projectCode,
					label: project.name,
				})),
			);
		}
		if (data && action == "add") {
			// console.log("form");
			if (data.project) {
				const { projectCode } = data.project;
				formik.setFieldValue("project", projectCode);
				const members = data.project.members;
				setMemberOptions(
					members.map((user: any) => ({
						label: user.name,
						value: user.username,
						image: user.profilePhoto,
					})),
				);
			}
			if (data.projects) {
				console.log("projects", data.projects);
			}
			if (data.projects && data.projects.length !== 0) {
				console.log("my projects", data.projects);
				setProjectOptions(
					data.projects.map((project: any) => ({
						label: project.name,
						value: project.projectCode,
					})),
				);
			}
		}
		if (data && action == "edit") {
			// formik.setFieldValue("title", data.title);
			console.log("data assignee", data);
			console.log("assigness :", data.assignee);
			formik.setValues({
				taskId: data.id,
				title: data.title,
				startDate: data.startTime || "",
				endDate: data.endTime || "",
				description: data.description,
				priority: parseInt(data.priority),
				status: parseInt(data.status),
				tags: data.tags,
				assigner: data.assigner.username,
				assignee: data.assignee.map(
					(user: any) => user.username,
				),
				project: data.project.projectCode,
			});

			setSelectedMembers(
				data.assignee.map((user: any) => user.username),
			);

			setMemberOptions(
				data.project.members.map((user: any) => ({
					label: user.name,
					value: user.username,
					image: user.profilePhoto,
				})),
			);
			// console.log(data.tags);
			setTags(data.tags.map((tag: any) => tag.name));
		}
	}, [data]);

	useEffect(() => {
		// const options =
		console.log("selected members", selectedMembers);
		formik.setFieldValue("assignee", selectedMembers);
	}, [selectedMembers]);

	useEffect(() => {
		formik.setFieldValue("tags", tags);
	}, [tags]);

	return (
		<>
			<form
				className='flex flex-col gap-3 h-[70%] overflow-auto bg-white'
				onSubmit={formik.handleSubmit}>
				<legend className='text-center font-bold text-slate-600 text-2xl'>
					{title || "Add Task"}
				</legend>
				<div className='flex flex-col'>
					<label
						htmlFor='title'
						className='text-sm text-slate-700'>
						Title<span className='text-red-500'>*</span>
					</label>
					<input
						type='text'
						name='title'
						placeholder='Enter title here...'
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value={formik.values.title}
						className={`border h-10 w-full  px-2  rounded-md  placeholder:text-sm${
							formik.errors.title
								? " border-red-500 focus:outline-red-500 placeholder:text-red-400"
								: " border-slate-300 "
						}`}
					/>
					{formik.touched.title && formik.errors.title && (
						<p className='text-red-400 text-xs px-2 mt-1'>
							{formik.errors.title}
						</p>
					)}
				</div>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
					{/* Start Date */}
					<div className='flex flex-col'>
						<label
							htmlFor='startDate'
							className='text-sm text-slate-700'>
							Start Date
						</label>
						<Calendar
							id='startDate'
							name='startDate'
							value={
								formik.values.startDate
									? new Date(
											formik.values.startDate,
									  )
									: null
							}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							showTime
							dateFormat='yy-mm-dd' // This ensures the format is 'yyyy-mm-dd'
							className={`h-10 w-full  rounded-md placeholder:text-sm ${
								formik.errors.startDate
									? "border-red-500 focus:outline-red-500 placeholder:text-red-400"
									: "border-slate-300"
							}`}
							placeholder='Start Time'
						/>
						{formik.errors.startDate && (
							<p className='text-red-400 text-xs px-2 mt-1'>
								{formik.errors.startDate}
							</p>
						)}
					</div>

					{/* End Date */}
					<div className='flex flex-col'>
						<label
							htmlFor='endDate'
							className='text-sm text-slate-700'>
							End Date
						</label>
						<Calendar
							id='endDate'
							name='endDate'
							showTime
							value={
								formik.values.endDate
									? new Date(
											formik.values.endDate,
									  )
									: null
							}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							placeholder='End Time'
							dateFormat='yy-mm-dd' // This ensures the format is 'yyyy-mm-dd'
							className={` h-10 w-full  rounded-md placeholder:text-sm ${
								formik.errors.endDate
									? "border-red-500 focus:outline-red-500 placeholder:text-red-400"
									: "border-slate-300"
							}`}
						/>
						{formik.errors.endDate && (
							<p className='text-red-400 text-xs px-2 mt-1'>
								{formik.errors.endDate}
							</p>
						)}
					</div>
				</div>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
					<div className='flex flex-col'>
						<label
							htmlFor='priority'
							className='text-sm text-slate-700'>
							Priority
						</label>
						<select
							name='priority'
							id='priority'
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.priority}
							className={`border h-10 w-full  px-2  rounded-md  placeholder:text-sm${
								formik.errors.priority
									? " border-red-500 focus:outline-red-500 placeholder:text-red-400"
									: " border-slate-300 "
							}`}>
							{taskPriorityStatus.map(
								(priority) => (
									<option
										value={
											priority.value
										}>
										{priority.label}
									</option>
								),
							)}
						</select>
						{formik.errors.priority && (
							<p className='text-red-400 text-xs px-2 mt-1'>
								{formik.errors.priority}
							</p>
						)}
					</div>
					<div className='flex flex-col'>
						<label
							htmlFor='status'
							className='text-sm text-slate-700'>
							Status
						</label>
						<select
							name='status'
							id='status'
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.status}
							className={`border h-10 w-full  px-2  rounded-md  placeholder:text-sm${
								formik.errors.status
									? " border-red-500 focus:outline-red-500 placeholder:text-red-400"
									: " border-slate-300 "
							}`}>
							{taskStatusOptions.map((status) => (
								<option value={status.value}>
									{status.label}
								</option>
							))}
						</select>
						{formik.errors.status && (
							<p className='text-red-400 text-xs px-2 mt-1'>
								{formik.errors.status}
							</p>
						)}
					</div>
				</div>

				<div className='flex flex-col'>
					<label
						htmlFor='project'
						className='text-sm text-slate-700'>
						Project
						<span className='text-red-500'>*</span>
					</label>
					{action == "edit" || (data && data.project) ? (
						<input
							type='text'
							value={data.project.name}
							className={`border h-10  w-full  px-2  rounded-md  placeholder:text-sm${
								formik.errors.project
									? " border-red-500 focus:outline-red-500 placeholder:text-red-400"
									: " border-slate-300 "
							}`}
							readOnly
						/>
					) : (
						<>
							<Select
								id='project'
								name='project'
								options={projectOptions}
								onBlur={formik.handleBlur}
								onChange={(selectedOptions) =>
									formik.setFieldValue(
										"project",
										selectedOptions?.value,
									)
								}
								value={projectOptions.filter(
									(option) =>
										formik.values
											.project ==
										option.value,
								)}
							/>
							{formik.errors.project && (
								<p className='text-red-400 text-xs px-2 mt-1'>
									{formik.errors.project}
								</p>
							)}
						</>
					)}
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
					<div className='flex flex-col'>
						<label
							htmlFor='assigner'
							className='text-sm text-slate-700'>
							Assigner
							<span className='text-red-500'>
								*
							</span>
						</label>

						<input
							type='text'
							value={
								action == "edit"
									? data.assigner.name
									: currentUser.name
							}
							className={`border h-10  w-full  px-2  rounded-md  placeholder:text-sm${
								formik.errors.assigner
									? " border-red-500 focus:outline-red-500 placeholder:text-red-400"
									: " border-slate-300 "
							}`}
							readOnly
						/>
						{formik.errors.assigner && (
							<p className='text-red-400 text-xs px-2 mt-1'>
								{formik.errors.assigner}
							</p>
						)}
					</div>

					<div className='flex flex-col'>
						<label
							htmlFor='assignee'
							className='text-sm text-slate-700'>
							Assignee
							<span className='text-red-500'>
								*
							</span>
						</label>
						<MultiSelect
							options={memberOptions}
							optionLabel='label'
							optionValue='value'
							onChange={(e) =>
								setSelectedMembers(e.value)
							}
							value={selectedMembers}
							placeholder='Select Members'
							filter
							itemTemplate={(member) => (
								<div className='flex gap-1 items-center'>
									<img
										src={`${process.env.NEXT_PUBLIC_SERVER_URL}/uploads/user/${member.image}`}
										className='w-10 h-10 rounded-full shadow bg-slate-400'></img>{" "}
									{member.label}
								</div>
							)}
							className={`border  w-full h-10 flex items-center  px-2  rounded-md  placeholder:text-sm${
								formik.errors.assignee
									? " border-red-500 focus:outline-red-500 placeholder:text-red-400"
									: " border-slate-300 "
							}`}
							disabled={formik.values.project == ""}
						/>
					</div>
				</div>

				<div>
					<label className='flex gap-1 items-center text-sm text-slate-800'>
						<Tag className='h-4 w-4  text-slate-400 ' />{" "}
						Tags
					</label>
					<TagInput
						tags={tags}
						setTags={setTags}
					/>
				</div>

				<div className='flex flex-col'>
					<label
						htmlFor='title'
						className='text-sm text-slate-700'>
						Description
					</label>
					<textarea
						rows={3}
						cols={10}
						name='description'
						placeholder='Enter text here...'
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value={formik.values.description}
						className={`border  w-full  px-2  rounded-md  placeholder:text-sm${
							formik.errors.description
								? " border-red-500 focus:outline-red-500 placeholder:text-red-400"
								: " border-slate-300 "
						}`}></textarea>
					{formik.errors.description && (
						<p className='text-red-400 text-xs px-2 mt-1'>
							{formik.errors.description}
						</p>
					)}
				</div>
				<div className='flex items-center justify-center'>
					<button
						type='submit'
						className='border bg-emerald-400 text-white rounded-md h-12 min-w-28 flex items-center justify-center'>
						{addTaskPending && (
							<span role='status'>
								<svg
									aria-hidden='true'
									className='w-5 h-5 text-gray-200 animate-spin dark:text-gray-300 fill-emerald-300'
									viewBox='0 0 100 101'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'>
									<path
										d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
										fill='currentColor'
									/>
									<path
										d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
										fill='currentFill'
									/>
								</svg>
								<span className='sr-only'>
									Loading...
								</span>
							</span>
						)}
						Submit
					</button>
				</div>
			</form>
			<Modal
				open={openModal}
				setOpen={setOpenModal}>
				<ResponseModal
					setOpen={setOpenModal}
					open={openModal}
					message={message}
					isSuccess={addTaskSuccess || editTaskSuccess}
					isLoading={pendingEdit}
					isError={addTaskError || editTaskError}
				/>
			</Modal>
		</>
	);
};

export default TaskForm;
