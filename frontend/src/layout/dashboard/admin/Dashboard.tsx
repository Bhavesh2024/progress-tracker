"use client";
import StatCard from "@/components/card/StatCard";
import { Package, Users } from "lucide-react";
import React from "react";
const AdminDashboard = () => {
	const statData = [
		{
			label: "Users",
			icon: <Users />,
			count: 100,
		},
		{
			label: "Projects",
			icon: <Package />,
			count: 100,
		},
	];

	return (
		<>
			<div className='flex flex-col gap-2 h-screen w-full items-center bg-slate-100 dark:bg-neutral-900'>
				<div className='grid grid-cols-2 gap-2 w-10/12 mt-28'>
					<div className='flex flex-col gap-3 w-full'>
						<div className='flex flex-col md:flex-row gap-3 w-full'>
							{statData.map((data: any) => (
								<StatCard {...data} />
							))}
						</div>
						<div></div>
					</div>
					<div></div>
				</div>
			</div>
		</>
	);
};

export default AdminDashboard;
