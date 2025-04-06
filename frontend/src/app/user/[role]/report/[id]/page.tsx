"use client";

import { useEffect, useState } from "react";
import { TabMenu } from "primereact/tabmenu";
import { useParams } from "next/navigation";
import { useGetUserReport } from "@/services/userApi";
import PageLoading from "@/components/loader/PageLoading";
import NotFound from "@/components/error/NotFound";
import TaskCard from "@/components/card/TaskCard";
import { useGetTrackerHistoryQuery } from "@/services/trackerApi";
import TrackerHistory from "@/components/table/TrackerHistory";
import ProjectCard from "@/components/card/ProjectCard";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import { SelectButton } from "primereact/selectbutton";
import { Dropdown } from "primereact/dropdown";
import { log } from "console";
import { X } from "lucide-react";
const UserReport = () => {
	const [activeIndex, setActiveIndex] = useState(0);
	const { id } = useParams() as any;
	const [history, setHistory] = useState([]);
	const [selectedDate, setSelectedDate] = useState<any>(null);
	const filterOption = ["Status", "Priority", "Project"];
	const [projectOption, setProjectOption] = useState([]);
	// 	export enum TaskStatus {
	// 	NotStarted = 0,
	// 	InProgress = 1,
	// 	Completed = 2,
	// 	Archived = 3,
	// 	Incomplete = 4,
	// }
	// export enum TaskPriority {
	// 	Low = 0,
	// 	High = 2,
	// 	Medium = 3,
	// 	Urent = 1,
	// }

	const [statusOption, setStatusOption] = useState([
		{ label: "Not Started", value: 0 },
		{ label: "In Progress", value: 2 },
		{ label: "Completed", value: 1 },
		{ label: "Archived", value: 4 },
		{ label: "Incomplete", value: 3 },
	]);

	const [priorityOption, setPriorityOption] = useState([
		{ label: "Low", value: 0 },
		{ label: "Urgent", value: 1 },
		{ label: "High", value: 2 },
		{ label: "Medium", value: 3 },
	]);

	const {
		data: userReport,
		isLoading: isLoadingReport,
		isError: isReportError,
		isSuccess: isReportSuccess,
	} = useGetUserReport(id);
	const {
		data: trackerHistory,
		isLoading: isLoadingHistory,
		isError: isHistoryError,
		isSuccess: isHistorySuccess,
	} = useGetTrackerHistoryQuery(id);
	const [openFilterDropdown, setOpenFilterDropdonwn] =
		useState<boolean>(false);
	const [openDropdown, setOpenDropdown] = useState<boolean>(false);
	const [user, setUser] = useState<any>(null);
	const [filter, setFilter] = useState<string>("Filter");
	const [tasks, setTasks] = useState<any>([]);
	const [selectedOption, setSelectedOption] = useState("");

	const tabs = [
		{ label: "Info", key: "info" },
		{ label: "Tasks", key: "tasks" },
		{ label: "Project", key: "project" },
		{ label: "History", key: "history" },
	];

	const searchTasks = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		console.log(value);
		console.log(tasks);
		if (value == "") {
			setTasks(userReport.report.following);
		} else {
			const filteredTasks = tasks.filter(
				(task: any) =>
					task.title.toLowerCase().includes(value) ||
					task.description.toLowerCase().includes(value),
			);
			console.log("filtered", filteredTasks);
			setTasks(filteredTasks);
		}
	};

	const filterTasks = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		let filteredTasks = [];
		setSelectedOption(value);
		const allTasks = userReport.report.following;
		if (value == "" || (typeof value == "number" && value == 0)) {
			setTasks(allTasks);
		}
		if (filter == "Status") {
			filteredTasks = allTasks.filter(
				(task: any) => value == task.status,
			);
			setTasks(filteredTasks);
		}
		if (filter == "Priority") {
			filteredTasks = allTasks.filter(
				(task: any) => value == task.priority,
			);
			setTasks(filteredTasks);
		}

		if (filter == "Project") {
			filteredTasks = allTasks.filter(
				(task: any) => value == task.project.projectCode,
			);
			setTasks(filteredTasks);
		}
	};
	useEffect(() => {
		if (Array.isArray(selectedDate) && selectedDate.length === 2) {
			const [startDate, endDate] = selectedDate.map((date) =>
				new Date(date).toISOString(),
			);

			// Ensure both dates are valid
			if (!startDate || !endDate) return;
			const allTasks = userReport && userReport.report.following;
			const filteredTasks = allTasks.filter((task: any) => {
				const taskStart = task.startTime
					? new Date(task.startTime).toISOString()
					: null;
				const taskEnd = task.endTime
					? new Date(task.endTime).toISOString()
					: null;

				// Ensure startDate and endDate are valid for comparison
				return (
					(taskStart &&
						taskStart >= startDate &&
						taskStart <= endDate) ||
					(taskEnd &&
						taskEnd >= startDate &&
						taskEnd <= endDate)
				);
			});

			setTasks(filteredTasks);
		}
	}, [selectedDate]);

	useEffect(() => {
		if (isReportSuccess) {
			if (userReport) {
				const { report } = userReport;
				console.log(report);
				setUser(report);
				setTasks(report.following);
				setProjectOption(
					report.projects.map((project: any) => ({
						label: project.name,
						value: project.projectCode,
					})),
				);
			}
		}
	}, [isReportSuccess]);

	useEffect(() => {
		if (trackerHistory) {
			setHistory(trackerHistory.history);
		}
	}, [isHistorySuccess]);

	useEffect(() => {
		if (filter) {
			setSelectedOption("");
			if (userReport) {
				setTasks(userReport.report.following);
			}
			setOpenFilterDropdonwn(false);
		}
	}, [filter]);
	return (
		<>
			{isLoadingReport && <PageLoading />}
			{isReportError && <NotFound />}
			{isReportSuccess && user && (
				<div className='flex flex-col mt-24 w-full md:w-11/12 mx-auto'>
					<div className='w-11/12 md:w-full mx-auto'>
						<TabMenu
							model={tabs}
							activeIndex={activeIndex}
							onTabChange={(e) =>
								setActiveIndex(e.index)
							}
						/>
					</div>
					<div className='border-0 md:border min-h-[70vh] rounded-md border-slate-300 p-1 md:p-4 mt-4'>
						{activeIndex === 0 && (
							<div className='flex flex-col items-center gap-2 capitalize'>
								<img
									src={`${process.env.NEXT_PUBLIC_SERVER_URL}/uploads/user/${user.profilePhoto}`}
									alt={user.name}
									title={user.name}
									className='h-40 w-40 rounded-full shadow-lg border-2 border-sky-200'
								/>

								<div className='w-full  bg-gray-50 p-4 rounded-md shadow-md'>
									<table className='w-full border-collapse border border-gray-300'>
										<tbody>
											<tr>
												<td className='border border-slate-400 p-2 font-semibold'>
													Employee
													Code
												</td>
												<td className='border border-slate-400 p-2'>
													{
														user.empCode
													}
												</td>
											</tr>
											<tr>
												<td className='border border-slate-400 p-2 font-semibold'>
													Name
												</td>
												<td className='border border-slate-400 p-2'>
													{
														user.name
													}
												</td>
											</tr>
											<tr>
												<td className='border border-slate-400 p-2 font-semibold'>
													Username
												</td>
												<td className='border border-slate-400 p-2'>
													{
														user.username
													}
												</td>
											</tr>

											<tr>
												<td className='border border-slate-400 p-2 font-semibold'>
													Birth
													Date
												</td>
												<td className='border border-slate-400 p-2'>
													{
														user.birthDate
													}
												</td>
											</tr>
											<tr>
												<td className='border border-slate-400 p-2 font-semibold'>
													Gender
												</td>
												<td className='border border-slate-400 p-2'>
													{
														user.gender
													}
												</td>
											</tr>
											<tr>
												<td className='border border-slate-400 p-2 font-semibold'>
													Email
												</td>
												<td className='border border-slate-400 p-2'>
													{
														user.email
													}
												</td>
											</tr>

											<tr>
												<td className='border border-slate-400 p-2 font-semibold'>
													Joining
													Date
												</td>
												<td className='border border-slate-400 p-2'>
													{
														user.joiningDate
													}
												</td>
											</tr>
											<tr>
												<td className='border border-slate-400 p-2 font-semibold'>
													Job
													Role
												</td>
												<td className='border border-slate-400 p-2'>
													{
														user.jobRole
													}
												</td>
											</tr>
											<tr>
												<td className='border border-slate-400 p-2 font-semibold'>
													Role
												</td>
												<td className='border border-slate-400 p-2'>
													{
														user.role
													}
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						)}
						{activeIndex === 1 && (
							<>
								<div className='flex flex-col md:flex-row justify-end gap-2 items-center'>
									<input
										type='text'
										name='search'
										onChange={
											searchTasks
										}
										className='border rounded-md shadow border-slate-500 h-10 px-3'
										placeholder='Search here..'
									/>
									{filter ==
										"Date & Time" && (
										<>
											<Calendar
												value={
													selectedDate
												}
												selectionMode='multiple'
												onChange={(
													e: any,
												) =>
													setSelectedDate(
														e.value,
													)
												}
												placeholder='Select Date & Time'
												showTime
												dateFormat='yyyy/mm/dd'
												className='h-10'
											/>
										</>
									)}
									{filterOption.includes(
										filter,
									) && (
										<>
											{
												<Dropdown
													value={
														selectedOption
													}
													options={
														filter ==
														"Status"
															? statusOption
															: filter ==
															  "Priority"
															? priorityOption
															: projectOption
													}
													placeholder={`Select ${
														filter ==
														"Status"
															? "Status"
															: filter ==
															  "Priority"
															? "Priority"
															: "Project"
													}`}
													onChange={(
														e: any,
													) =>
														filterTasks(
															e,
														)
													}
													className='h-10 flex items-center'
												/>
											}
										</>
									)}
									<div className='relative flex items-center gap-2'>
										<button
											className='bg-slate-100 rounded-md shadow h-10 min-w-20 px-2 text-nowrap'
											onClick={() =>
												setOpenFilterDropdonwn(
													!openFilterDropdown,
												)
											}>
											{filter}
										</button>
										{filter !==
											"Filter" && (
											<button
												className='bg-slate-100 rounded-md shadow h-10 min-w-20 px-2 text-nowrap'
												onClick={() => {
													setFilter(
														"Filter",
													);
													setTasks(
														userReport
															.report
															.following,
													);
												}}>
												Clear
											</button>
										)}

										{openFilterDropdown && (
											<div className='flex min-w-40 bg-white/100 rounded-md  absolute top-full mt-1 -end-4 shadow-lg z-20 '>
												<ul className='flex flex-col gap-1 py-2 justify-center w-full'>
													<li
														className='text-center w-full hover:bg-sky-50 py-1 '
														onClick={() => {
															setFilter(
																"Status",
															);
														}}>
														Status
													</li>
													<li
														className='text-center w-full hover:bg-sky-50 py-1'
														onClick={() => {
															setFilter(
																"Priority",
															);
														}}>
														Priority
													</li>
													<li
														className='text-center w-full hover:bg-sky-50 py-1'
														onClick={() => {
															setFilter(
																"Project",
															);
														}}>
														Project
													</li>
													<li
														className='text-center w-full hover:bg-sky-50 py-1'
														onClick={() => {
															setFilter(
																"Date & Time",
															);
														}}>
														Date
														&
														Time
													</li>
												</ul>
											</div>
										)}
									</div>
								</div>
								<hr className='text-slate-300 my-3' />
								<div className='grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-3'>
									{tasks.map(
										(task: any) => (
											<TaskCard
												key={
													task.id
												}
												data={
													task
												}
												open={
													openDropdown ===
													task.id
												}
												setOpen={() =>
													setOpenDropdown(
														openDropdown ===
															task.id
															? null
															: task.id,
													)
												}
											/>
										),
									)}
								</div>
							</>
						)}

						{activeIndex === 2 && (
							<div className='flex '>
								{/* {JSON.stringify(user.projects)} */}
								<>
									<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-5  w-11/12'>
										{user.projects.map(
											(
												project: any,
											) => (
												<ProjectCard
													destination=''
													data=''
													title={
														project.name
													}
												/>
											),
										)}
									</div>
								</>
							</div>
						)}
						{activeIndex === 3 && (
							<div>
								{isLoadingHistory && (
									<PageLoading></PageLoading>
								)}
								{isHistoryError && (
									<div className='flex items-center justify-center w-full h-full'>
										No History Found
									</div>
								)}
								{isHistorySuccess &&
									history && (
										<>
											<TrackerHistory
												data={
													history
												}
											/>
										</>
									)}
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
};

export default UserReport;
