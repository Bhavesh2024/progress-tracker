"use client";

import React from "react";
type Props = {
	setOpen: (state: boolean) => void;
	data: any;
	open: boolean;
};
const ViewUser: React.FC<Props> = ({ setOpen, data }) => {
	const {
		name,
		username,
		role,
		jobRole,
		joiningDate,
		birthDate,
		empCode,
		email,
		phone,
	} = data;
	const userData = [
		{
			title: "ID",
			value: empCode,
		},
		{
			title: "Name",
			value: name,
		},
		{
			title: "Username",
			value: username,
		},
		{
			title: "Email",
			value: email,
		},
		{
			title: "Phone",
			value: phone,
		},
		{
			title: "Role",
			value: role,
		},
		{
			title: "Job Role",
			value: jobRole,
		},
		{
			title: "Birth Date",
			value: birthDate.split("T")[0],
		},
		{
			title: "Joining Date",
			value: joiningDate.split("T")[0],
		},
	];
	return (
		<>
			<div className='flex flex-col p-3 items-center  bg-white rounded-md max-h-[75vh] w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/3 mx-auto  shadow-md'>
				<div className='grid-cols-1 px-1'>
					<img
						src={`${process.env.NEXT_PUBLIC_SERVER_URL}/uploads/user/${data.profilePhoto}`}
						className='h-32 w-32 rounded-md shadow-xl'></img>
				</div>
				<div className='grid-cols-1'>
					<table>
						{userData.map((data, index) => (
							<>
								<tr className='flex items-center justify-between mt-2'>
									<th className='flex w-1/2'>
										{data.title}
									</th>
									<td className='flex  w-1/2 text-nowrap'>
										{data.value}
									</td>
								</tr>
							</>
						))}
					</table>
					<div className='flex justify-center'>
						<button
							className='bg-emerald-500 text-white shadow h-10 min-w-32 p-2 rounded-md my-4'
							onClick={() => setOpen(false)}>
							Close
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default ViewUser;

// EMP_CODE
// NAME
// BIRTH_DATE
// JOINING_DATE;
// EMAIL;
// PHONE;
// JOB_ROLE;
// USER_ROLE;
// PROFILE_PHOTO;
// USERNAME;
// PASSWORD;
