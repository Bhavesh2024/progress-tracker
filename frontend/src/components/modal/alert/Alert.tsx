import React, { useCallback, useEffect, useState } from "react";
import { Loader, ShieldCheck, ShieldX, X } from "lucide-react";

type Props = {
	open: boolean;
	setOpen: (state: boolean) => void;
	message?: string;
	positiveAction?: () => void;
	negativeAction?: () => void;
	title: string;
	isSuccess: boolean;
	isError: boolean;
	successMessage: string;
	errMessage: string;
	isLoading: boolean;
};

const Alert: React.FC<Props> = ({
	open,
	setOpen,
	positiveAction,
	message,
	negativeAction,
	successMessage,
	errMessage,
	isSuccess,
	isError,
	isLoading,
	title,
}) => {
	const [openMessageModal, setOpenMessageModal] = useState(false);

	// Show message modal when success or error
	useEffect(() => {
		if (isSuccess || isError) {
			setOpenMessageModal(true);
		}
	}, [isSuccess, isError]);

	// Reset message modal on unmount
	useEffect(() => {
		return () => setOpenMessageModal(false);
	}, []);

	return (
		<>
			<div
				className='bg-slate-50 z-30 shadow w-72 mx-auto min-h-fit rounded-md flex flex-col gap-3 relative'
				onClick={(e) => e.stopPropagation()}>
				{openMessageModal ? (
					<div className='min-h-52 w-full flex flex-col gap-3 p-3 items-center justify-center'>
						<div>
							{isLoading && (
								<Loader className='w-16 h-16 text-gray-200 mx-auto animate-spin dark:text-gray-600 fill-blue-600' />
							)}
							{isSuccess && (
								<div className='flex flex-col mx-auto gap-2 items-center justify-center'>
									<ShieldCheck className='text-emerald-400 size-20' />
									<span className='text-lg text-slate-600 font-semibold'>
										{successMessage}
									</span>
								</div>
							)}
							{isError && (
								<div className='flex flex-col mx-auto gap-2 items-center justify-center'>
									<ShieldX className='text-red-500 size-28' />
									<span className='text-lg text-slate-600 font-semibold'>
										{successMessage}
									</span>
								</div>
							)}
						</div>
						<p className='text-lg font-sans text-gray-500'>
							{isError
								? errMessage
								: successMessage}
						</p>
						<button
							className={`${
								isError
									? "bg-red-400"
									: "bg-emerald-400"
							} text-white rounded-md h-10 p-2 shadow-sm w-24 text-lg`}
							onClick={() => {
								setOpen(false);
								setOpenMessageModal(false);
							}}>
							OK
						</button>
					</div>
				) : (
					<>
						<div className='flex py-1 px-3'>
							<h1 className='text-xl font-sans font-medium'>
								{title}
							</h1>
							<X
								className='absolute top-2 end-2 text-slate-500 cursor-pointer'
								onClick={() => {
									setOpen(false);
									setOpenMessageModal(
										false,
									);
								}}
							/>
						</div>
						<div className='flex px-3 min-h-12 items-center'>
							<p>
								{message ||
									"Are you sure you want to logout?"}
							</p>
						</div>
						<div className='flex justify-end gap-3 py-3 px-3'>
							<button
								className='text-blue-500 rounded-md px-3 py-2'
								onClick={() => {
									positiveAction?.();
									setOpenMessageModal(
										false,
									); // Reset message modal
								}}>
								Yes
							</button>
							<button
								className='text-red-500 px-3 py-2'
								onClick={() => {
									negativeAction?.();
									setOpenMessageModal(
										false,
									); // Reset message modal
								}}>
								No
							</button>
						</div>
					</>
				)}
			</div>
		</>
	);
};

export default Alert;
