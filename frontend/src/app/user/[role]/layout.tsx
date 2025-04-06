"use client"; // This ensures that this code is only executed on the client side

import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Modal from "@/components/modal/Modal";
import Alert from "@/components/modal/alert/Alert";
import { useMutation } from "@tanstack/react-query";
import { logoutUser, useCheckLogin } from "@/services/authApi";
import PageLoading from "@/components/loader/PageLoading";
import NotFound from "@/components/error/NotFound";
import { sidebarActivities } from "@/app/data/sidebar";
import Sidebar from "@/layout/Sidebar";
import Navbar from "@/layout/Navbar";
import { useCurrentUserStore } from "@/hooks/useCurrentUserStore";

// Google Fonts Setup (Geist Sans and Geist Mono)
const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { role } = useParams();
	const [openDropdown, setOpenDropdown] = useState<boolean>(false);
	const [openDrawer, setOpenDrawer] = useState<boolean>(
		window.matchMedia("(max-width:576px)").matches ? false : true,
	);
	const [isAccessible, setIsAccessible] = useState<boolean>(false);
	const [pageLoading, setPageLoading] = useState(true);
	const [openLogoutModal, setOpenLogoutModal] = useState<boolean>(false);
	const { currentUser, updateCurrentUser } = useCurrentUserStore();
	const {
		data: user,
		isLoading,
		isError,
		isSuccess,
	} = useCheckLogin(typeof role == "string" ? role : "developer");
	const pathname = usePathname();
	const router = useRouter();
	const {
		mutate: logoutMutation,
		isSuccess: logoutSuccess,
		isError: logoutError,
		isPending: logoutPending,
	} = useMutation({
		mutationFn: logoutUser,
		onSuccess: (data) => {
			router.push(`/user/${role}/auth/login`);
		},
		onError: (err) => {
			console.log("Error:-", err.message);
		},
	});
	const handleLogout = () => {
		logoutMutation(typeof role == "string" ? role : "developer");
	};
	useEffect(() => {
		if (isSuccess) {
			if (user) {
				updateCurrentUser(
					(user as any).currentUser
						? (user as any).currentUser
						: null,
				);
				// console.log(user.currentUser);
			}
			localStorage.setItem(
				"lastUser",
				`${role ? role : "developer"}`,
			);
			const accessRoutesList = sidebarActivities
				.filter((activity: any) => activity.role.includes(role))
				.map((access) => access.link);
			// accessRoutesList.push(`/`);
			const currentPath = pathname;
			// console.log("/");
			if (
				pathname == `/user/${role}` ||
				pathname == `/user/${role}/` ||
				pathname == `/user/${role}/edit-profile`
			) {
				setIsAccessible(true);
			} else {
				const isAuthenticatedUser = accessRoutesList.some(
					(link) => currentPath.includes(link),
				);
				console.log("authorized", isAuthenticatedUser);
				setIsAccessible(isAuthenticatedUser);
			}
		}
	}, [isSuccess]);
	useEffect(() => {
		console.log(isAccessible);
		setPageLoading(false);
	}, [isAccessible]);
	useEffect(() => {
		console.log("my new user", currentUser);
	}, [currentUser]);
	return (
		<>
			{isLoading && <PageLoading />}
			{isError && !pathname.includes("auth") && <NotFound />}
			{isSuccess && !pathname.includes("auth") ? (
				<>
					{isAccessible ? (
						<div
							className={`${geistSans.variable} ${geistMono.variable}  flex w-full max-w-screen`}>
							{/* Wrap the app with MUI theme and apply global styles */}
							{openDrawer && (
								<Sidebar
									open={openDrawer}
									setOpen={setOpenDrawer}
									role={
										typeof role ==
										"string"
											? role
											: "developer"
									}
									menuList={
										sidebarActivities
									}
									openLogout={
										openLogoutModal
									}
									setOpenLogout={
										setOpenLogoutModal
									}
								/>
							)}
							<div
								className={`flex flex-col w-full ${
									!openDrawer
										? "md:w-full"
										: "md:w-[80%] md:left-[20%]"
								} fixed`}>
								<Navbar
									open={openDrawer}
									setOpen={setOpenDrawer}
									openDropdown={
										openDropdown
									}
									setOpenDropdown={
										setOpenDropdown
									}
									setOpenLogout={
										setOpenLogoutModal
									}
								/>
								<div className='overflow-y-auto max-h-screen'>
									{children}
								</div>
								<Modal
									open={openLogoutModal}
									setOpen={
										setOpenLogoutModal
									}>
									<div className='h-[90vh] flex items-center justify-center'>
										<Alert
											title='Logout'
											message='Are you sure to Logout ?'
											open={
												openLogoutModal
											}
											setOpen={
												setOpenLogoutModal
											}
											positiveAction={
												handleLogout
											}
											negativeAction={() =>
												setOpenLogoutModal(
													false,
												)
											}
											isError={
												logoutError
											}
											isLoading={
												logoutPending
											}
											isSuccess={
												logoutSuccess
											}
											successMessage='Logout Successfully'
											errMessage='Logout Failed'
										/>
									</div>
								</Modal>
							</div>
						</div>
					) : (
						!pageLoading && isError && <NotFound />
					)}
				</>
			) : (
				pathname.includes("auth") && <div>{children}</div>
			)}
		</>
	);
}
