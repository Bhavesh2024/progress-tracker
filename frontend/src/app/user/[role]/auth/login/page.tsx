"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthResponse, loginUser } from "@/services/authApi";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
// import {RootLayout} from './layout'
export default function Login() {
	const queryClient = useQueryClient();
	const router = useRouter();
	const { role } = useParams();
	// State to manage user input
	const [user, setUser] = useState<{
		username: string;
		password: string;
		role: string;
	}>({
		username: "",
		password: "",
		role: typeof role == "string" ? role : "user",
	});
	const [open, setOpen] = useState<boolean>(false);

	const [message, setMessage] = useState<string>("");

	// useMutation for handling login
	const { mutate, data, error, isError, isSuccess, isPending } =
		useMutation<
			AuthResponse, // ✅ Expected API response type
			AxiosError,
			{ username: string; password: string; role: string } // ✅ Expected mutation variables
		>({
			mutationFn: loginUser,
			// ✅ Pass user argument correctly
			onSuccess: (data) => {
				console.log("Login Successful:", data);
				setMessage(data.message);
				setUser({
					...user,
					username: "",
					password: "",
					role: "",
				});
				setTimeout(() => {
					router.push(`/user/${role}/`);
				}, 1000);
			},
			onError: (err) => {
				if (err instanceof Error) {
					setMessage(err.message);
				}
			},
		});

	// Handle form submission
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Submitting:", user);
		setOpen(true);

		mutate(user); // ✅ Pass user object here
		setTimeout(() => {
			setOpen(false);
		}, 500);
	};

	// Handle input changes
	const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setUser({ ...user, [name]: value });
	};

	return (
		<>
			{open && !isPending && (
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					className={`p-3 w-full md:w-10/12 lg:w-2/3 rounded-md text-center ${
						isError ? "bg-red-300" : "bg-emerald-300"
					}`}>
					{message}
				</motion.div>
			)}
			<form
				className='flex flex-col gap-2 w-full lg:w-2/3 border p-4 rounded-md border-slate-300 mt-2'
				onSubmit={handleSubmit}>
				<legend className='text-emerald-400 text-3xl md:text-3xl text-center font-semibold font-sans '>
					Login
				</legend>
				<div>
					<input
						type='text'
						name='username'
						value={user.username}
						placeholder='Username'
						onChange={handleInput}
						className='flex border border-slate-300 p-3 rounded-md w-full'
						required
					/>
				</div>
				<div>
					<input
						type='password'
						name='password'
						value={user.password}
						placeholder='Password'
						onChange={handleInput}
						className='flex border border-slate-300 p-3 rounded-md  w-full'
						required
					/>
				</div>
				<div className='flex justify-end'>
					<Link
						href={`/user/${role}/auth/verification`}
						className='text-end text-xs text-gray-500'>
						Forgot Password ?
					</Link>
				</div>
				<div className='flex justify-center items-center'>
					<button
						type='submit'
						name='submit'
						className='flex items-center justify-center h-12 min-w-24 capitalize p-4 rounded-md bg-emerald-400 text-slate-200'>
						Submit
					</button>
				</div>
			</form>
		</>
	);
}
