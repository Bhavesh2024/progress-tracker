import {
	ChartBarIncreasing,
	ClockFading,
	LayoutDashboard,
	ListCheck,
	Notebook,
	SquareActivity,
	User,
} from "lucide-react";
export const sidebarActivities = [
	{
		title: "Dashboard",
		link: "/dashboard",
		role: ["admin", "developer"],
		icon: <LayoutDashboard />,
	},
	{
		title: "User",
		link: "/users",
		role: ["admin", "moderator"],
		icon: <User />,
	},
	{
		title: "Tasks",
		link: "/tasks",
		role: ["admin", "developer", "moderator"],
		icon: <ListCheck />,
	},
	{
		title: "Project",
		link: "/project",
		role: ["admin", "moderator"],
		icon: <ChartBarIncreasing />,
	},
	{
		title: "Report",
		link: "/report",
		role: ["admin", "moderator"],
		icon: <Notebook />,
	},
	{
		title: "Tracker",
		link: "/tracker",
		role: ["developer"],
		icon: <ClockFading />,
	},
];
