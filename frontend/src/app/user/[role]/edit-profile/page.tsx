"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useCurrentUserStore } from "@/hooks/useCurrentUserStore";
import { UpdateUser } from "@/interface/user";
import { userDataPattern } from "@/utils/pattern";
import { useMutation } from "@tanstack/react-query";
import { updateUserProfile } from "@/services/userApi";
import Modal from "@/components/modal/Modal";
import ResponseModal from "@/components/modal/response/ResponseModal";
import { useParams, useRouter } from "next/navigation";
const EditProfile = () => {
	const { role } = useParams();
	const { currentUser, updateCurrentUser } = useCurrentUserStore();
	const { id, name, email, phone, username, profilePhoto } = currentUser;
	const [message, setMessage] = useState<string>("");
	const [openMessage, setOpenMessage] = useState<boolean>(false);
	const router = useRouter();
	const {
		data: user,
		mutate: UpdateProfileMutation,
		isSuccess: updateSuccess,
		isError: updateError,
	} = useMutation({
		mutationFn: updateUserProfile,
		onSuccess: (data) => {
			setMessage(data.message);
			setOpenMessage(true);
			updateCurrentUser(data.user);
		},
		onError: (err) => {
			setMessage(err.message);
			setOpenMessage(true);
		},
	});
	const fileRef = useRef<any>(null);
	const {
		name: namePattern,
		email: emailPattern,
		phone: phonePattern,
		username: usernamePattern,
	} = userDataPattern;

	const formik = useFormik<UpdateUser>({
		initialValues: {
			id: id,
			name: name,
			username: username,
			email: email,
			phone: phone,
			profilePhoto: profilePhoto,
		},
		onSubmit: (data) => {
			const { id, name, username, email, phone, profilePhoto } =
				data;
			try {
				const formData = new FormData();
				formData.append("id", id);
				formData.append("name", name);
				formData.append("username", username);
				formData.append("email", email);
				formData.append("phone", phone);
				formData.append(
					"role",
					typeof role == "string" ? role : "",
				);

				if (profilePhoto instanceof File) {
					formData.append("image", profilePhoto);
				}
				UpdateProfileMutation(formData);
			} catch (err) {
				if (err instanceof Error) {
					console.log(err.message);
				}
			}
		},
		validationSchema: Yup.object({
			name: Yup.string()
				.required("Name is required")
				.matches(namePattern, "Name is Not in valid format"),
			email: Yup.string()
				.required("Email is required")
				.matches(emailPattern, "Email is Not in valid format"),
			username: Yup.string()
				.required("Username is required")
				.matches(
					usernamePattern,
					"Username is Not in valid format",
				),
			phone: Yup.string()
				.required("Phone Number is required")
				.matches(
					phonePattern,
					"Phone Number is Not in valid format",
				),
		}),
		validateOnBlur: true,
		validateOnChange: true,
		validateOnMount: false,
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
			formik.setFieldValue("profilePhoto", file);
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
		if (openMessage) {
			setTimeout(() => {
				setOpenMessage(false);
				setMessage("");
				if (updateSuccess) {
					router.push(`/user/${role}/`);
				}
			}, 2000);
		}
	}, [openMessage, updateSuccess]);

	return (
		<div className='flex items-center justify-center h-screen w-full'>
			<form
				onSubmit={formik.handleSubmit}
				action=''
				className='w-full md:w-10/12 lg:w-2/3 2xl:w-1/2 flex flex-col gap-2 border shadow-lg border-slate-200 rounded-md p-3 py-4 '>
				<legend className='text-center w-full text-2xl font-semibold text-slate-800'>
					Edit Profile
				</legend>

				<div className='flex flex-col gap-2 items-center w-full'>
					<div
						className='h-36 w-36 mx-auto flex items-center justify-center  p-0 border border-slate-300 rounded-full'
						onDrop={handleDrop}
						onClick={() => fileRef.current?.click()}>
						{/* Check if profileprofilePhoto is a string */}
						<img
							src={
								typeof formik.values
									.profilePhoto === "string"
									? formik.values
											.profilePhoto !==
									  ""
										? `${process.env.NEXT_PUBLIC_SERVER_URL}/uploads/user/${formik.values.profilePhoto}`
										: "/images/user.png"
									: formik.values
											.profilePhoto
									? URL.createObjectURL(
											formik.values
												.profilePhoto,
									  )
									: "/images/user.png"
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
							accept='profilePhoto/jpg,profilePhoto/png'
							name='profilePhoto'
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
				{/* Your Name*/}
				<div className='flex flex-col '>
					<input
						type='text'
						name='name'
						placeholder='Your Name'
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

				{/* Username */}
				<div className='flex flex-col'>
					<input
						type='text'
						name='username'
						placeholder='Username'
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value={formik.values.username}
						className={`border h-10 w-full  px-2  rounded-md  placeholder:text-sm${
							formik.errors.username
								? " border-red-500 focus:outline-red-500 placeholder:text-red-400"
								: " border-slate-300 "
						}`}
					/>
					{formik.errors.username && (
						<p className='text-red-400 text-xs px-2 mt-1'>
							{formik.errors.username}
						</p>
					)}
				</div>

				<div className='flex flex-col'>
					<input
						type='email'
						name='email'
						placeholder='Email'
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value={formik.values.email}
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

				<div className='flex flex-col'>
					<input
						type='tel'
						name='phone'
						placeholder='Phone'
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
				<div className='flex justify-center'>
					<button className='bg-emerald-500 rounded-md px-4 h-10 min-w-24 text-white'>
						Update
					</button>
				</div>
			</form>
			<Modal
				open={openMessage}
				setOpen={setOpenMessage}>
				<ResponseModal
					open={openMessage}
					message={message}
					isSuccess={updateSuccess}
					setOpen={setOpenMessage}
				/>
			</Modal>
		</div>
	);
};

export default EditProfile;
