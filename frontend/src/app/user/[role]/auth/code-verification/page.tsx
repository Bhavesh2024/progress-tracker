"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import {
	handleCodeVerification,
	handleVerification,
	resendOTP,
} from "@/services/authApi";
import { useParams, useRouter } from "next/navigation";

export default function CodeVerification() {
	const { role } = useParams();
	const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
	const [message, setMessage] = useState<string>("");
	const [open, setOpen] = useState<boolean>(false);
	const router = useRouter();

	const { mutate: verificationMutate, isError: verificationError } =
		useMutation({
			mutationFn: () =>
				resendOTP(typeof role == "string" ? role : "developer"),
			onSuccess: (data) => {
				setOpen(true);
				setMessage(data.message);
			},
			onError: (err) => {
				setOpen(true);
				setMessage(err.message);
			},
		});
	const { mutate, isPending, isError } = useMutation({
		mutationFn: () =>
			handleCodeVerification(
				typeof role === "string" ? role : "developer",
				Number(otp.join("")), // Convert OTP array to number
			),
		onSuccess: (data) => {
			setMessage(data.message);
			setOpen(true);
			if (data.token) {
				router.push(
					`/user/${role}/auth/forgot-password/${data.token}`,
				);
			}
		},
		onError: (err) => {
			setMessage(
				err instanceof Error
					? err.message
					: "Verification failed",
			);
			setOpen(true);
		},
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		index: number,
	) => {
		const value = e.target.value;
		if (/^[0-9]$/.test(value)) {
			const newOtp = [...otp];
			newOtp[index] = value;
			setOtp(newOtp);

			// Auto move to next input
			if (index < 5 && value !== "") {
				document.getElementById(`otp-${index + 1}`)?.focus();
			}
		} else if (value === "") {
			// Allow backspace
			const newOtp = [...otp];
			newOtp[index] = "";
			setOtp(newOtp);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (otp.includes("")) {
			setMessage("Please enter all 6 digits");
			setOpen(true);
			return;
		}
		mutate();
	};

	useEffect(() => {
		if (open) {
			setTimeout(() => {
				setOpen(false);
			}, 3000);
		}
	}, [open]);
	return (
		<>
			{open && (
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					className={`p-3 w-full md:w-10/12 lg:w-2/3 rounded-md text-center ${
						isError || verificationError
							? "bg-red-300"
							: "bg-emerald-300"
					}`}>
					{message}
				</motion.div>
			)}
			<div className='w-full px-4 sm:px-8 py-10 font-sans'>
				<header className='mb-8'>
					<h1 className='text-2xl font-bold mb-1'>
						OTP Code Verification
					</h1>
					<p className='text-[15px] text-slate-500'>
						Enter the 6-digit verification code sent to
						your phone number.
					</p>
				</header>
				<form
					id='otp-form'
					className='w-full md:w-2/3'
					onSubmit={handleSubmit}>
					<div className='flex items-center justify-between gap-1 md:gap-3 w-full'>
						{otp.map((_, index) => (
							<input
								key={index}
								id={`otp-${index}`}
								type='text'
								value={otp[index]}
								onChange={(e) =>
									handleChange(e, index)
								}
								className='w-10 h-10 md:w-14 md:h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border border-emerald-200 hover:border-slate-200 appearance-none rounded py-4 outline-none focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-indigo-100'
								maxLength={1}
							/>
						))}
					</div>
					<div className='w-full mt-4'>
						<button
							type='submit'
							className='w-full inline-flex justify-center whitespace-nowrap rounded-lg bg-emerald-400 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-950/10 hover:bg-emerald-500 focus:outline-none focus:ring focus:ring-indigo-300 transition-colors duration-150'>
							{isPending
								? "Verifying..."
								: "Verify Account"}
						</button>
					</div>
					<div className='text-sm text-slate-500 mt-4 text-center md:text-end'>
						Didn't receive code?{" "}
						<button
							type='button'
							className='font-medium text-emerald-400 hover:text-emerald-600 p-0'
							onClick={() => verificationMutate()}>
							Resend
						</button>
					</div>
				</form>
			</div>
		</>
	);
}
