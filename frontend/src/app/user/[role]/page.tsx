"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { checkLogin, useCheckLogin } from "@/services/authApi";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import PageLoading from "@/components/loader/PageLoading";
import NotFound from "@/components/error/NotFound";
import Dashboard from "./dashboard/page";
// import Home from "@/app/page";
const UserPanel = () => {
	const { role } = useParams<{ role: string }>();
	const router = useRouter();
	const userRole = typeof role == "string" ? role : "developer";
	const {
		data: user,
		isLoading,
		isError,
		isSuccess,
	} = useCheckLogin(userRole);
	useEffect(() => {}, [userRole, user, isLoading, isError]);
	return (
		<>
			{/* <div>Hello</div> */}
			{isLoading && <PageLoading />}
			{isError && <NotFound />}
			{isSuccess && <Dashboard />}
		</>
	);
};

export default UserPanel;
