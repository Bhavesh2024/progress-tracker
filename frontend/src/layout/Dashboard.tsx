"use client";

import React, { useEffect, useState } from "react";
import { useGetDashboardData } from "@/services/userApi";
import StatCard from "@/components/card/StatCard";
import { Package, Users } from "lucide-react";

type Props = {
	role: string;
};
const Dashboard = ({ role = "developer" }) => {
	const {
		data: dashboardData,
		isLoading: dashboardDataLoading,
		isError: dashboardDataError,
		isSuccess: dashboardDataSuccess,
	} = useGetDashboardData();
	const [data, setData] = useState<any>();

	useEffect(() => {
		if (dashboardDataSuccess) {
			const { data } = dashboardData;
			setData(data);
		}
	}, [dashboardDataSuccess]);
	return (
		<div className='flex justify-center h-screen w-full items-center'>
			{data && (
				<>
					<div className='grid grid-cols-1 md:grid-cols-2 w-11/12'>
						<div className='flex flex-col md:flex-row gap-2 w-full'>
							<>
								<StatCard
									icon={<Users />}
									label='Users'
									count={data.count.user}
								/>
								<StatCard
									icon={<Package />}
									label='Project'
									count={data.count.project}
								/>
							</>
						</div>
						<div className=''></div>
					</div>
				</>
			)}
		</div>
	);
};

export default Dashboard;
