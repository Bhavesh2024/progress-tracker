"use client";

import React, { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { useCurrentUserStore } from "@/hooks/useCurrentUserStore";
import { useParams } from "next/navigation";
import { useGetUserCurrentTask } from "@/services/taskApi";
import { useTrackerTaskStore } from "@/hooks/useTrackerTaskStore";
type Props = {
	open: boolean;
	setOpen: (state: boolean) => void;
	openDropdown: boolean;
	setOpenDropdown: (state: boolean) => void;
	setOpenLogout: (state: boolean) => void;
};
const Navbar: React.FC<Props> = ({
	open,
	setOpen,
	openDropdown,
	setOpenDropdown,
	setOpenLogout,
}) => {
	const { currentUser } = useCurrentUserStore();
	const [imageSrc, setImageSrc] = useState<string>(
		currentUser && currentUser.profilePhoto !== ""
			? `${process.env.NEXT_PUBLIC_SERVER_URL}/uploads/user/${currentUser.profilePhoto}`
			: "/images/user.png",
	);
	const { role } = useParams();
	const { tasks, addAllTasks, removeAllTasks } = useTrackerTaskStore();
	const {
		data: currentTasks,
		isLoading: isCurrentTasksLoading,
		isError: isCurrentTasksError,
		isSuccess: isCurrentTasksSuccess,
	} = useGetUserCurrentTask(currentUser.id);

	useEffect(() => {
		if (isCurrentTasksSuccess) {
			if (currentTasks) {
				console.log("currentTasks", currentTasks);
				addAllTasks(currentTasks.tasks);
			}
		}
	}, [isCurrentTasksSuccess]);

	useEffect(() => {
		return () => removeAllTasks();
	}, []);
	return (
		<>
			<nav
				className={`flex min-h-20 ${
					!open ? "w-full" : "w-full md:w-[80%]"
				} bg-slate-100 z-30 justify-between items-center shadow px-5 fixed`}
				onClick={(e) => e.stopPropagation()}>
				<div className='flex items-center gap-3'>
					<Menu
						onClick={() => setOpen(!open)}
						className='hover:text-slate-600'
					/>

					{/* <h1 className='font-semibold text-xl font-sans'>
						Admin
					</h1> */}
				</div>
				<div className='flex items-center relative'>
					<Image
						src={`${
							currentUser.profilePhoto == ""
								? "/images/user.png"
								: `${process.env.NEXT_PUBLIC_SERVER_URL}/uploads/user/${currentUser.profilePhoto}`
						}`}
						height={40}
						width={40}
						alt='profile image'
						className='w-10 h-10 rounded-full object-cover' // ✅ Ensures full coverage
						onClick={() =>
							setOpenDropdown(!openDropdown)
						}
					/>

					{openDropdown && (
						<motion.div
							initial={{
								opacity: 0,
								top: "40px",
							}}
							animate={{
								opacity: 1,
							}}
							className='flex min-w-40 bg-white rounded-md  absolute top-full mt-1 -end-4 shadow-lg '>
							<ul className='flex flex-col gap-1 py-2 justify-center w-full'>
								<li className='text-center w-full hover:bg-sky-50 py-1'>
									<Link
										href={`/user/${role}/edit-profile`}
										className=''>
										Edit Profile
									</Link>
								</li>
								<li
									className='text-center w-full hover:bg-sky-50 py-1'
									onClick={() =>
										setOpenLogout(true)
									}>
									Logout
								</li>
							</ul>
						</motion.div>
					)}
				</div>
			</nav>
		</>
	);
};

export default Navbar;
