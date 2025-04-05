"use client";

import React, { useCallback, useEffect } from "react";
import { CircleCheckBig, CircleX, Loader } from "lucide-react";
type Props = {
	open: boolean;
	isSuccess: boolean;
	isError: boolean;
	message: string;
	isLoading: boolean;
	setOpen: (state: boolean) => void;
};
const ResponseModal: React.FC<Props> = ({
	setOpen,
	isSuccess,
	isError,
	message,
	isLoading,
}) => {
	useEffect(
		useCallback(() => {
			setTimeout(() => {
				setOpen(false);
			}, 2000);
		}, []),
	);
	return (
		<div>
			<div className='min-h-52  mx-auto  flex flex-col gap-3 p-3 items-center justify-center bg-white w-60 max-w-72 rounded-md shadow-xl'>
				<div>
					{/* {isSuccess ? (
					) : (
					)} */}
					{isSuccess && (
						<CircleCheckBig className='text-emerald-400 size-20 ' />
					)}
					{isLoading && <Loader />}
					{isError && (
						<CircleX className='text-red-500 size-28 ' />
					)}
				</div>

				<p className='text-lg font-sans text-nowrap text-gray-500 text-center'>
					{message}
				</p>
			</div>
		</div>
	);
};

export default ResponseModal;
