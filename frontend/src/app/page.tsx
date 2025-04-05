"use client";

import { useCheckLogin } from "@/services/authApi";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PageLoading from "@/components/loader/PageLoading";

export default function Home() {
	const router = useRouter();
	const { role } = useParams<{ role: string }>();
	const lastUser =
		typeof localStorage.getItem("lastUser") == "string"
			? localStorage.getItem("lastUser")
			: "developer";
	const { data: user, isSuccess, isLoading } = useCheckLogin(`${lastUser}`);

	useEffect(() => {
		if (isSuccess) {
			// console.log("Redirecting to:", `/user/${userRole}/`);
			router.push(`/user/${lastUser}/`);
		} else {
			router.replace(`/user/${lastUser}/auth/login`);
		}
	}, [isSuccess]);

	return isLoading ? <PageLoading /> : null;
}
