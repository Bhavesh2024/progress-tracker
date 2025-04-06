"use client";
import { useParams } from "next/navigation";
import Dashboard from "@/layout/Dashboard";
import React from "react";

const UserDashboard = () => {
	const { role } = useParams();

	return (
		<>
			<Dashboard
				role={typeof role == "string" ? role : "developer"}
			/>
		</>
	);
};

export default UserDashboard;
