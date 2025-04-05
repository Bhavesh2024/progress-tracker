"use client";

import NotFound from "@/components/error/NotFound";
import PageLoading from "@/components/loader/PageLoading";
import { handleForgotPassword, useVerifyUser } from "@/services/authApi";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { useFormik } from "formik";
import { FormValues } from "@/interface/auth";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
const ForgotPassword = () => {
	const { role, token } = useParams();
	const { isLoading, isError, data } = useVerifyUser(
		typeof role == "string" ? role : "developer",
		typeof token == "string" ? token : "",
	);
	const router = useRouter();
	const [open, setOpen] = useState<boolean>(false);
	const [message, setMessage] = useState<string>("");

	const passwordPattern =
		/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

	// Yup validation schema
	const validationSchema = yup.object({
		password: yup
			.string()
			.matches(
				passwordPattern,
				"Password must be at least 8 characters, include uppercase, lowercase, number, and special character",
			)
			.required("Password is required"),
		confirmPassword: yup
			.string()
			.oneOf([yup.ref("password")], "Passwords must match")
			.required("Confirm Password is required"),
	});

	const {
		mutate,
		isPending,
		isError: forgotError,
	} = useMutation({
		mutationFn: (values: FormValues) =>
			handleForgotPassword(
				typeof role === "string" ? role : "developer",
				data && typeof data.user.email === "string"
					? data.user.email
					: "",
				values.password,
			),
		onSuccess: (user) => {
			setMessage(user.message);
			setOpen(true);
			router.push(
				`/user/${
					typeof role == "string" ? role : "developer"
				}/auth/login`,
			);
		},
		onError: (err) => {
			setMessage(err.message);
			setOpen(true);
		},
	});

	// Formik setup
	const formik = useFormik<FormValues>({
		initialValues: {
			email: data?.user?.email || "",
			password: "",
			confirmPassword: "",
		},
		validationSchema,
		onSubmit: async (values) => {
			mutate(values);
		},
		enableReinitialize: true, // Ensures email updates when data is fetched
	});

	useEffect(() => {
		if (open) {
			const timeout = setTimeout(() => {
				setOpen(false);
			}, 3000);
			return () => clearTimeout(timeout);
		}
	}, [open]);

	return (
		<>
			{isLoading && <PageLoading />}
			{isError && <NotFound />}
			{data && (
				<div className='flex flex-col justify-center px-6 py-8 md:h-screen lg:py-0 relative'>
					{open && (
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							className={`p-3 w-full md:w-10/12 lg:w-2/3 rounded-md text-center ${
								isError || forgotError
									? "bg-red-300"
									: "bg-emerald-300"
							}`}>
							{message}
						</motion.div>
					)}
					<div className='w-full md:w-3/4 p-6 bg-white rounded-lg md:mt-0 sm:p-8'>
						<h2 className='mb-1 text-xl font-bold leading-tight tracking-tight text-emerald-400 md:text-2xl'>
							Change Password
						</h2>
						<form
							onSubmit={formik.handleSubmit}
							className='mt-4 space-y-4 lg:mt-5 md:space-y-5'>
							{/* Email Field (Disabled) */}
							<div>
								<input
									type='email'
									name='email'
									id='email'
									value={
										formik.values.email
									}
									className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5'
									disabled
								/>
							</div>

							{/* Password Field */}
							<div>
								<input
									type='password'
									name='password'
									id='password'
									placeholder='New Password'
									value={
										formik.values
											.password
									}
									onChange={
										formik.handleChange
									}
									onBlur={formik.handleBlur}
									className={`bg-gray-50 border ${
										formik.errors
											.password
											? "border-red-500 text-red-500 focus:border-red-500"
											: "border-gray-300 text-gray-900 focus:ring-primary-600 focus:border-primary-600"
									} text-sm rounded-lg block w-full p-2.5`}
								/>
								{formik.touched.password &&
									formik.errors
										.password && (
										<p className='text-red-500 text-sm mt-1'>
											{
												formik
													.errors
													.password
											}
										</p>
									)}
							</div>

							{/* Confirm Password Field */}
							<div>
								<input
									type='password'
									name='confirmPassword'
									id='confirmPassword'
									placeholder='Confirm Password'
									value={
										formik.values
											.confirmPassword
									}
									onChange={
										formik.handleChange
									}
									onBlur={formik.handleBlur}
									className={`bg-gray-50 border ${
										formik.errors
											.confirmPassword
											? "border-red-500 text-red-500 focus:border-red-500"
											: "border-gray-300 text-gray-900 focus:ring-primary-600 focus:border-primary-600"
									} text-sm rounded-lg block w-full p-2.5`}
								/>
								{formik.touched
									.confirmPassword &&
									formik.errors
										.confirmPassword && (
										<p className='text-red-500 text-sm mt-1'>
											{
												formik
													.errors
													.confirmPassword
											}
										</p>
									)}
							</div>

							{/* Submit Button */}
							<button
								type='submit'
								disabled={isPending}
								className='w-full text-white bg-emerald-400 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center'>
								{isPending
									? "Resetting..."
									: "Reset Password"}
							</button>
						</form>
					</div>
				</div>
			)}
		</>
	);
};

export default ForgotPassword;
