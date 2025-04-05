"use client";

import { useUserStore } from "@/hooks/useUserStore";
import { useGetAllUser } from "@/services/userApi";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";

const ReportModule = () => {
	const {
		isError: isAllUserError,
		isLoading: isAllUsersLoading,
		data: allUsers,
		isSuccess: isAllUserSuccess,
	} = useGetAllUser();

	const { users, addNewUser, clearAllUsers } = useUserStore();

	useEffect(() => {
		if (isAllUserSuccess) {
			console.log(allUsers);
			// users.push(allUsers.users);
			if (users.length == 0) {
				allUsers.users.forEach((user: any) => {
					addNewUser(user);
				});
			}
		}
	}, [isAllUserSuccess]);

	// useEffect(() => {
	// 	return () => {
	// 		clearAllUsers();
	// 	};
	// }, []);
	return (
		<div className='flex mt-24 justify-center  h-screen w-full overflow-auto'>
			<div>
				{isAllUserSuccess && users && (
					<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mx-auto w-full md:w-11/12 p-4'>
						{users.map((user: any) => (
							<>
								<Link
									href={`/user/admin/report/${user.id}`}>
									<div className='flex flex-col gap-2 border rounded-md border-slate-200 bg-white shadow-xl'>
										<Image
											src={`${process.env.NEXT_PUBLIC_SERVER_URL}/uploads/user/${user.profilePhoto}`}
											height={100}
											width={100}
											className='min-h-24 h-fit  w-full md:h-44 md:w-52 rounded-t-md '
											alt={
												"Profile Image"
											}
											title={
												user.name
											}
											// onError={'/images/user.png'}
										/>
										<span className='text-center h-10 flex  justify-center text-lg text-slate-600'>
											{user.name}
										</span>
									</div>
								</Link>
							</>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default ReportModule;
