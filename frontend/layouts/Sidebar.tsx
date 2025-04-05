"use client";

import React, { useState } from "react";
import Image from "next/image";
import { LogOut, X } from "lucide-react";
import Link from "next/link";
import { useCurrentUserStore } from "@/hooks/useCurrentUserStore";

type Props = {
	open: boolean;
	setOpen: (state: boolean) => void;
	role: string | undefined;
	menuList: any;
	openLogout: boolean;
	setOpenLogout: (state: boolean) => void;
};
const Sidebar: React.FC<Props> = ({
	open,
	setOpen,
	role,
	menuList,
	openLogout,
	setOpenLogout,
}) => {
	const { currentUser } = useCurrentUserStore();

	return (
		<>
			<aside
				className={`${
					open ? "flex" : "hidden"
				} z-30 fixed w-2/3 md:fixed md:flex flex-col gap-3 bg-slate-100 md:w-1/5 md:min-w-[20%] h-screen items-center shadow overflow-auto `}
				onClick={(e) => e.stopPropagation()}>
				<X
					className='absolute top-2 end-2 text-slate-500 hover:text-slate-400 md:hidden'
					onClick={() => setOpen(false)}></X>
				<div className='mt-20 flex flex-col gap-3'>
					<Image
						src={
							currentUser &&
							currentUser.profilePhoto !== ""
								? `${process.env.NEXT_PUBLIC_SERVER_URL}/uploads/user/${currentUser.profilePhoto}`
								: "/images/user.png"
						}
						height={128}
						width={128}
						alt='profile image'
						className='w-32 h-32 rounded-full object-cover mx-auto' // ✅ Ensures full coverage
					/>
					<h1 className='text-center text-xl font-semibold text-slate-800 font-sans'>
						{currentUser && currentUser.name}
					</h1>
					<Link
						href={`/user/${role}/edit-profile`}
						className='flex justify-center text-blue-500 text-sm'>
						Edit Profile
					</Link>
				</div>
				<div className='flex mt-5 w-full'>
					<ul className='flex flex-col gap-4 w-full items-center'>
						<>
							{menuList &&
								menuList
									.filter((data: any) =>
										data.role.includes(
											typeof role ===
												"string"
												? role
												: "developer",
										),
									)
									.map((data: any) => (
										<li
											key={
												data.link
											}
											className='w-full'>
											<Link
												className='flex items-center gap-3 w-full hover:bg-slate-300 py-3 justify-center'
												href={`/user/${role}/${data.link}`}>
												<span className='flex w-fit'>
													{
														data.icon
													}
												</span>
												<span className='w-2/5'>
													{
														data.title
													}
												</span>
											</Link>
										</li>
									))}
						</>
					</ul>
				</div>
				<div className='flex h-full items-end w-full'>
					<div
						className='flex items-center gap-3 w-full hover:bg-slate-950 py-3 justify-center bg-slate-800 text-white'
						role='button'
						onClick={() => setOpenLogout(!openLogout)}>
						<span className='flex w-fit'>
							<LogOut />
						</span>
						<span className='w-2/5'>Logout</span>
					</div>
				</div>
			</aside>
			;
		</>
	);
};

export default Sidebar;
