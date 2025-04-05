"use client";

import React, {
	useState,
	ReactNode,
	ChangeEvent,
	useRef,
	useEffect,
} from "react";
import { useFormik } from "formik";
import { UserFormData } from "@/interface/user";
import * as Yup from "yup";
import { userDataPattern } from "@/utils/pattern";
import { jobRoleList, userRoleList } from "@/app/data/input";
import { ContactRound, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { addUser, editUser } from "@/services/userApi";
import MessageModal from "../modal/message/MessageModal";
import { useUserStore } from "@/hooks/useUserStore";

import { Calendar } from "primereact/calendar";
import ResponseModal from "../modal/response/ResponseModal";
import Modal from "../modal/Modal";

type Props = {
	open: boolean;
	setOpen: (state: boolean) => void;
	formTitle: string;
	data: any;
	action: string;
	// children: ReactNode;
};

const UserForm: React.FC<Props> = ({
	open,
	setOpen,
	formTitle,
	data,
	action,
}) => {
	const [currentStep, setCurrentStep] = useState<number>(1);
	const [checked, setChecked] = useState<boolean>(false);
	const [step, setStep] = useState<{ status: boolean; index: number }>({
		status: false,
		index: 1,
	});
	const fileRef = useRef<HTMLInputElement | null>(null);
	const [message, setMessage] = useState<string>("");
	const [openMessage, setOpenMessage] = useState<boolean>(false);
	const MIN_AGE = 18;
	const { name, email, empCode, username, password, phone } =
		userDataPattern;

	const { users, addNewUser, updateUser } = useUserStore();
	const {
		mutate: addUserMutate,
		isError,
		isPending,
		isSuccess: addSuccess,
	} = useMutation({
		mutationFn: addUser,
		onSuccess: (data) => {
			setMessage(data.message);
			setOpenMessage(true);

			addNewUser(data.user);
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
		mutationFn: editUser,
		onSuccess: (data) => {
			setMessage(data.message);
			setOpenMessage(true);
			updateUser(data.user);
		},
		onError: (err) => {
			setMessage(data.message);
			setOpenMessage(true);
		},
	});
	// const [image,setImage] = useState(false)
	const formik = useFormik<UserFormData>({
		initialValues: {
			empCode: "",
			image: "/images/user.png",
			name: "",
			birthDate: "",
			gender: "",
			email: "",
			phone: "",
			joiningDate: "",
			userRole: "developer",
			jobRole: "",
			username: "",
			password: "",
			infoUser: true,
		},
		validationSchema: Yup.object({
			name: Yup.string()
				.required("Name is required")
				.matches(name, "Name is not in valid format "),
			birthDate: Yup.string()
				.required("Birth Date is required")
				.test("valid-date", "Invalid date format", (value) => {
					return !isNaN(Date.parse(value || ""));
				})
				.test(
					"age",
					`You must be at least ${MIN_AGE} years old`,
					function (value) {
						if (!value) return false;

						const currentDate = new Date();
						const birthDate = new Date(value);

						if (isNaN(birthDate.getTime()))
							return false; // Ensure valid date format

						let age =
							currentDate.getFullYear() -
							birthDate.getFullYear();
						const monthDiff =
							currentDate.getMonth() -
							birthDate.getMonth();

						if (
							monthDiff < 0 ||
							(monthDiff === 0 &&
								currentDate.getDate() <
									birthDate.getDate())
						) {
							age--;
						}

						return age >= MIN_AGE;
					},
				),

			gender: Yup.string().required("Gender is Required"),
			email: Yup.string()
				.required("Email is required")
				.matches(email, "Email is not in valid format "),
			phone: Yup.string()
				.required("Phone number is Required")
				.matches(phone, "Phone is not in valid format"),
			empCode: Yup.string().when([], {
				is: () => action == "edit",
				then: (schema) =>
					schema
						.required("Employee Code is Required")
						.matches(
							empCode,
							"Employee Code is not in valid format",
						),
				otherwise: (schema) => schema.notRequired(),
			}),
			jobRole: Yup.string().required("Job Role is Required"),
			userRole: Yup.string().required("User Role is Required"),
			username: Yup.string().when([], {
				is: () => action === "edit",
				then: (schema) =>
					schema
						.required("Username is Required")
						.matches(
							username,
							"Username is not in valid format",
						),
				otherwise: (schema) => schema.notRequired(),
			}),
		}),
		onSubmit: async (data) => {
			try {
				console.log("Data : ", data);
				const formData = new FormData();
				Object.entries(data).forEach(([key, value]) => {
					console.log(key);
					formData.append(key, value);
				});

				action == "add"
					? addUserMutate(formData)
					: updateMutation(formData);
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

	const handleFileUpload = (
		e: React.ChangeEvent<HTMLInputElement> | File,
	) => {
		let file: File | undefined;

		if ((e as React.ChangeEvent<HTMLInputElement>).target) {
			file = (e as React.ChangeEvent<HTMLInputElement>).target
				.files?.[0];
		} else if (e instanceof File) {
			file = e;
		}

		if (file) {
			formik.setFieldValue("image", file);
			console.log("File uploaded:", file);
		} else {
			console.log("No file selected");
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		const file = e.dataTransfer.files[0];
		handleFileUpload(file);
	};

	useEffect(() => {
		if (data) {
			formik.setValues({
				empCode: data.empCode || "",
				image: data.profilePhoto || "",
				name: data.name || "",
				birthDate: data.birthDate
					? data.birthDate.split("T")[0]
					: "",
				gender: data.gender || "",
				email: data.email || "",
				phone: data.phone || "",
				joiningDate: data.joiningDate
					? data.joiningDate.split("T")[0]
					: "",
				userRole: data.userRole || "developer",
				jobRole: data.jobRole || "",
				username: data.username || "",
				password: data.password || "",
				infoUser: false,
			});
		}
	}, [data]);
	useEffect(() => {
		if (action == "add") {
			formik.setFieldValue("image", "");
		}
	}, []);

	useEffect(() => {
		setTimeout(() => {
			setOpenMessage(false);
			setMessage("");
			if (addSuccess || updateSuccess) {
				setOpen(false);
			}
		}, 2000);
	}, [openMessage]);
	return (
		<>
			<div className='flex w-full md:w-2/3 lg:w-1/2 xl:w-1/2 bg-white rounded-md shadow p-3 mx-auto relative'>
				<form
					className='w-full flex flex-col gap-3 justify-center h-fit relative'
					onSubmit={formik.handleSubmit}>
					<div className='flex justify-center w-full mt-3'>
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
								isError={isError || updateError}
								isLoading={
									isPending || updatePending
								}
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
					<div className='flex flex-col gap-2 items-center w-full'>
						<div
							className='h-36 w-36 mx-auto flex items-center justify-center  p-0 border border-slate-300 rounded-full'
							onDrop={handleDrop}
							onClick={() =>
								fileRef.current?.click()
							}>
							{/* Check if profileImage is a string */}
							<img
								src={
									formik.values.image
										? typeof formik
												.values
												.image ===
										  "string"
											? action ===
											  "edit"
												? `${process.env.NEXT_PUBLIC_SERVER_URL}/uploads/user/${formik.values.image}`
												: formik
														.values
														.image
											: URL.createObjectURL(
													formik
														.values
														.image,
											  )
										: "/images/user.png" // Default image when no image is selected
								}
								className='h-[100%] rounded-full'
								alt='Profile'
							/>
						</div>
						<div className='w-fix'>
							<input
								type='file'
								id='file'
								ref={fileRef}
								accept='image/jpg,image/png'
								name='image'
								onChange={handleFileUpload}
								hidden
							/>
							<button
								type='button'
								className='h-10  rounded-full bg-emerald-400 min-w-32 w-fit px-3 shadow-sm text-white'
								onClick={() =>
									fileRef.current?.click()
								}>
								Upload
							</button>
						</div>
					</div>
					{action == "edit" && (
						<div className='flex flex-col w-full grid-cols-1'>
							<input
								type='text'
								name='empCode'
								placeholder='Employee Id'
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.empCode}
								className={`border h-10 w-full  px-2  rounded-md  placeholder:text-sm${
									formik.errors.empCode
										? " border-red-500 focus:outline-red-500 placeholder:text-red-400"
										: " border-slate-300 "
								}`}
								disabled
							/>
							{formik.errors.empCode && (
								<p className='text-red-400 text-xs px-2 mt-1'>
									{formik.errors.empCode}
								</p>
							)}
						</div>
					)}
					<div
						className={`grid grid-cols-1 ${
							action == "add"
								? "md:grid-cols-1"
								: "grid-cols-2  gap-3"
						}`}>
						<div className='flex flex-col'>
							<input
								type='text'
								name='name'
								placeholder='Employee Name'
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
						{action == "edit" && (
							<>
								<div className='flex flex-col w-full'>
									<input
										type='username'
										name='username'
										placeholder='Username'
										value={
											formik.values
												.username
										}
										onChange={
											formik.handleChange
										}
										onBlur={
											formik.handleBlur
										}
										className={`border h-10 w-full  px-2  rounded-md  placeholder:text-sm${
											formik.errors
												.username
												? " border-red-500 focus:outline-red-500 placeholder:text-red-400"
												: " border-slate-300 "
										}`}
									/>
									{formik.errors
										.username && (
										<p className='text-red-400 text-xs px-2 mt-1'>
											{
												formik
													.errors
													.username
											}
										</p>
									)}
								</div>
							</>
						)}
					</div>

					<div className='flex flex-col gap-3 '>
						<div className='w-full'>
							<select
								name='gender'
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.gender}
								className={`border h-10 w-full  px-2  rounded-md  placeholder:text-sm${
									formik.errors.gender
										? " border-red-500 focus:outline-red-500 placeholder:text-red-400 text-sm text-red-400"
										: " border-slate-300 "
								}`}>
								<option
									value=''
									selected
									className='text-xs text-slate-400'>
									Gender
								</option>
								<option
									value='male'
									className='text-slate-800'>
									Male
								</option>
								<option
									value='female'
									className='text-slate-800'>
									Female
								</option>
								<option
									value='other'
									className='text-slate-800'>
									Other
								</option>
							</select>
							{formik.errors.gender && (
								<p className='text-red-400 text-xs px-2 mt-1'>
									{formik.errors.gender}
								</p>
							)}
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
							<div className='w-full flex flex-col gap-1 '>
								<select
									name='userRole'
									onChange={
										formik.handleChange
									}
									onBlur={formik.handleBlur}
									value={
										formik.values
											.userRole
									}
									className={`border h-10 w-full  px-2  rounded-md  placeholder:text-sm${
										formik.errors
											.userRole
											? " border-red-500 focus:outline-red-500 placeholder:text-red-400 text-sm text-red-400"
											: " border-slate-300 "
									}`}>
									<div className='bg-emerald-300'>
										{userRoleList.map(
											(
												job,
												index,
											) => (
												<option
													value={
														job.value
													}
													selected={
														job.title ==
														"default"
													}
													className='text-slate-900'>
													{job.title ==
													"default"
														? "Job Title"
														: job.title}
												</option>
											),
										)}
									</div>
								</select>
								{formik.errors.userRole && (
									<p className='text-red-400 text-xs px-2 mt-1'>
										{
											formik.errors
												.userRole
										}
									</p>
								)}
							</div>
							<div className='flex flex-col '>
								<select
									name='jobRole'
									onChange={
										formik.handleChange
									}
									onBlur={formik.handleBlur}
									value={
										formik.values
											.jobRole
									}
									className={`border h-10 w-full  px-2  rounded-md  placeholder:text-sm${
										formik.errors
											.jobRole
											? " border-red-500 focus:outline-red-500 placeholder:text-red-400 text-sm text-red-400"
											: " border-slate-300 "
									}`}>
									<div className='bg-emerald-300'>
										{jobRoleList.map(
											(
												job,
												index,
											) => (
												<option
													value={
														job.value
													}
													selected={
														job.title ==
														"default"
													}
													className='text-slate-900'>
													{job.title ==
													"default"
														? "Job Title"
														: job.title}
												</option>
											),
										)}
									</div>
								</select>
								{formik.errors.jobRole && (
									<p className='text-red-400 text-xs px-2 mt-1'>
										{
											formik.errors
												.jobRole
										}
									</p>
								)}
							</div>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 mt-1 gap-2'>
							<div className='flex flex-col'>
								{/* <div> */}

								<Calendar
									name='birthDate'
									value={
										formik.values
											.birthDate
											? new Date(
													formik.values.birthDate,
											  )
											: null
									}
									onChange={
										formik.handleChange
									}
									onBlur={formik.handleBlur}
									className={`h-10  rounded-md text-gray-900 ${
										formik.errors
											.birthDate
											? "!border-red-500 focus:!outline-red-500"
											: "!border-slate-300"
									} peer`}
									placeholder='Birth Date'
									dateFormat='dd-mm-yy'
								/>

								{formik.errors.birthDate && (
									<p className='text-red-400 text-xs px-2 mt-1'>
										{
											formik.errors
												.birthDate
										}
									</p>
								)}
							</div>
							<div className='flex flex-col'>
								<Calendar
									name='joiningDate'
									value={
										formik.values
											.joiningDate
											? new Date(
													formik.values.joiningDate,
											  )
											: null
									}
									onChange={
										formik.handleChange
									}
									onBlur={formik.handleBlur}
									className={`h-10  rounded-md text-gray-900 ${
										formik.errors
											.joiningDate
											? "!border-red-500 focus:!outline-red-500"
											: "!border-slate-300"
									} peer`}
									placeholder='Joining Date'
									dateFormat='dd-mm-yy'
								/>

								{formik.errors.joiningDate && (
									<p className='text-red-400 text-xs px-2 mt-1'>
										{
											formik.errors
												.joiningDate
										}
									</p>
								)}
							</div>
						</div>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 mt-2 gap-3'>
						<div className='flex flex-col '>
							<input
								type='tel'
								name='phone'
								placeholder='Phone Number'
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.phone}
								className={`border h-10 w-full  px-2  rounded-md  placeholder:text-sm${
									formik.errors.phone
										? " border-red-500 focus:outline-red-500 placeholder:text-red-400"
										: " border-slate-300 "
								}`}
							/>
							{formik.errors.phone && (
								<p className='text-red-400 text-xs px-2 mt-1'>
									{formik.errors.phone}
								</p>
							)}
						</div>

						<div className='flex flex-col '>
							<input
								type='email'
								name='email'
								placeholder='Email'
								value={formik.values.email}
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								className={`border h-10 w-full  px-2  rounded-md  placeholder:text-sm${
									formik.errors.email
										? " border-red-500 focus:outline-red-500 placeholder:text-red-400"
										: " border-slate-300 "
								}`}
							/>
							{formik.errors.email && (
								<p className='text-red-400 text-xs px-2 mt-1'>
									{formik.errors.email}
								</p>
							)}
						</div>
					</div>
					{action == "add" && (
						<div className='flex gap-2 items-center'>
							<input
								type='checkbox'
								id='infoUser'
								onChange={() =>
									formik.setFieldValue(
										"infoUser",
										!formik.values
											.infoUser,
									)
								}
								name='infoUser'
								checked={formik.values.infoUser}
								className=''
							/>
							<label
								htmlFor='#infoUser'
								className='text-sm text-slate-500'>
								Credential send to user
							</label>
						</div>
					)}
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

export default UserForm;
