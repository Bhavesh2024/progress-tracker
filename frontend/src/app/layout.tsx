"use client"; // This ensures that this code is only executed on the client side
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import Home from "./page";
import Image from "next/image";
import { usePathname } from "next/navigation";
// Google Fonts Setup (Geist Sans and Geist Mono)
const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	return (
		<html lang='en'>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				{pathname.includes("auth") ? (
					<div className='flex h-screen justify-center w-full items-center'>
						<div className='hidden lg:block w-1/2 h-full'>
							<Image
								src='/task-management.svg'
								alt='Task Management'
								width={200}
								height={200}
								className='h-full w-full'
							/>
						</div>
						<div className='w-11/12 md:w-10/12 lg:w-1/2 flex flex-col gap-4 justify-center '>
							{/* Wrap the app with MUI theme and apply global styles */}
							<QueryProvider>
								{children}{" "}
							</QueryProvider>
						</div>
					</div>
				) : (
					<QueryProvider>{children} </QueryProvider>
				)}
			</body>
		</html>
	);
}
