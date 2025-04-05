"use client";

import AdminDashboard from "@/layout/dashboard/admin/Dashboard";
import UserDashboard from "@/layout/dashboard/user/Dashboard";
import { useParams } from "next/navigation";
import React from "react";

const Dashboard = () => {
	const { role } = useParams();

	return <>{role == "admin" ? <AdminDashboard /> : <UserDashboard />}</>;
};

export default Dashboard;
