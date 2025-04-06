"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Play, Pause, StopCircle, X } from "lucide-react";
import { DataTable } from "primereact/datatable";
import { useCurrentUserStore } from "@/hooks/useCurrentUserStore";
import { useMutation } from "@tanstack/react-query";
import {
	setTrackerTime,
	useGetTrackerHistoryQuery,
	useGetTrackerTimeQuery,
} from "@/services/trackerApi";
import { Tracker } from "@/interface/tracker";
import { Column } from "primereact/column";
import { useTrackerHistoryStore } from "@/hooks/useTrackerHistoryStore";
import { useGetUserCurrentTask } from "@/services/taskApi";
import { useTrackerTaskStore } from "@/hooks/useTrackerTaskStore";
import TaskItem from "@/components/list/TaskItem";
import { Calendar } from "primereact/calendar";
import { io } from "socket.io-client";
import TrackerHistory from "@/components/table/TrackerHistory";

const UserTracker = () => {
	// const storedStartTime = localStorage.getItem("startTime");
	// const storedElapsedTime = localStorage.getItem("elapsedTime");
	const { history, addToHistory, clearHistory, addAllToHistory } =
		useTrackerHistoryStore();
	const socket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}`);

	const [startTime, setStartTime] = useState<Date | string>("");
	const [selectedDateRange, setSelectedDateRange] = useState<Date[] | null>(
		null,
	);

	const { currentUser } = useCurrentUserStore();
	const [data, setData] = useState<Tracker>({
		startTime: "",
		stopTime: "",
		type: "start",

		userId:
			currentUser && typeof currentUser.id == "string"
				? currentUser.id
				: "",
		task: [],
	});
	const [lastStartTime, setLastStartTime] = useState<Date | string>("");
	const [seconds, setSeconds] = useState(0);
	const [isActive, setIsActive] = useState(false);
	const [isPaused, setIsPaused] = useState(false);

	const {
		data: trackerHistory,
		isLoading: isHistoryLoading,
		isError: isHistoryError,
		isSuccess: isHistorySuccess,
	} = useGetTrackerHistoryQuery(currentUser.id);

	const { tasks: currentTasks, addReceivedTasks } = useTrackerTaskStore();

	// Start the timer
	const startTimer = () => {
		setIsActive(true);
		setIsPaused(false);
		if (typeof window !== "undefined") {
			localStorage.setItem("startTime", Date.now().toString());
		}
	};

	// Stop the timer and reset to 0
	const stopTimer = () => {
		setIsActive(false);
		setIsPaused(false);
		setSeconds(0);
		if (typeof window !== "undefined") {
			// const token = localStorage.getItem("token");
			// // use token...
			localStorage.removeItem("startTime");
			localStorage.removeItem("elapsedTime");
		}
	};

	const {
		mutate: setTime,
		data: trackerTimeData,
		isPending: isSetTimePending,
		isError: isSetTimeError,
		isSuccess: isSetTimeSuccess,
	} = useMutation({
		mutationFn: setTrackerTime,
		onSuccess: (data) => {
			if (data.time) {
				const { stopTime } = data.time;
				if (stopTime) {
					console.log(stopTime);
					addToHistory(data.time);
				}
			}
		},
		onError: (err) => {
			console.log(err.message);
		},
	});

	const {
		data: trackerTime,
		isLoading: isTrackerTimeLoading,
		isError: isTrackerTimeError,
		isSuccess: isTrackerTimeSuccess,
	} = useGetTrackerTimeQuery(
		typeof data.type == "string" ? data.type : "start",
	);

	useEffect(() => {
		let interval: any;

		if (isActive && !isPaused) {
			interval = setInterval(() => {
				const elapsed = Math.floor(
					(Date.now() - new Date(startTime).getTime()) /
						1000,
				);
				setSeconds(elapsed);
				// localStorage.setItem("elapsedTime", elapsed.toString());
			}, 1000);
		} else {
			clearInterval(interval);
		}

		return () => clearInterval(interval);
	}, [isActive, isPaused, startTime]);

	const formatTime = (startDateTime: Date | string) => {
		// Parse the given datetime string (ISO format or any valid format)
		const startDate = new Date(startDateTime);

		// Get the current date/time
		const currentDate = new Date();

		// Calculate the difference in total seconds
		const timeDifference = Math.floor(
			(currentDate.getTime() - startDate.getTime()) / 1000,
		);

		const hours = Math.floor(timeDifference / 3600);
		const minutes = Math.floor((timeDifference % 3600) / 60);
		const seconds = timeDifference % 60;

		if (!startDateTime) {
			return `${String("").padStart(2, "0")}h : ${String(
				"",
			).padStart(2, "0")}m : ${String("").padStart(2, "0")}s`;
		}
		return `${String(hours).padStart(2, "0")}h : ${String(
			minutes,
		).padStart(2, "0")}m : ${String(seconds).padStart(2, "0")}s`;
	};

	const handleTime = async (type: string) => {
		try {
			const key = {
				start: "startTime",
				pause: "pauseTime",
				stop: "stopTime",
			} as any;
			setTime({
				...data,
				[key[type]]: new Date(Date.now()).toISOString(),
				type: type,
			});
		} catch (err) {
			if (err instanceof Error) {
				console.log(err.message);
			}
		}
	};

	useEffect(() => {
		if (isSetTimeSuccess) {
			const { time } = trackerTimeData as any;
			const { startTime: trackerStartTime, stopTime } = time;
			console.log(trackerTimeData);
			if (trackerStartTime && stopTime == null) {
				setStartTime(trackerStartTime);
				console.log("dgdffhdf");
				setIsActive(true);
			} else if (startTime && stopTime) {
				setStartTime("");
				console.log("sdsgdgdgds");
			} else {
				setStartTime("");
			}
		}
	}, [isSetTimeSuccess, trackerTime]);

	useEffect(() => {
		if (isTrackerTimeSuccess) {
			const { time } = trackerTime as any;
			const { startTime: trackerStartTime, stopTime } = time;
			console.log("start time", trackerStartTime);
			console.log("end time", stopTime);
			if (trackerStartTime && stopTime == null) {
				setStartTime(trackerStartTime);
				console.log("dgdffhdf");
				setIsActive(true);
			} else if (startTime && stopTime) {
				setStartTime("");
				console.log("sdsgdgdgds");
			} else {
				setStartTime("");
			}
		}
	}, [isTrackerTimeSuccess]);

	useEffect(() => {
		if (isHistorySuccess) {
			if (trackerHistory) {
				addAllToHistory(trackerHistory.history);
			}
		}
	}, [isHistorySuccess]);

	useEffect(() => {
		return () => {
			clearHistory();
		};
	}, []);
	useEffect(() => {
		// Set up the socket listener
		const handleReceivedTask = ({ task }: any) => {
			if (task) {
				const isAssignee = task.assignee.some(
					(user: any) => user.id == currentUser.id,
				);
				if (isAssignee) {
					addReceivedTasks(task);
				}
			}
		};

		socket.on("receivedTask", handleReceivedTask);

		// Clean up the socket listener on unmount or when dependencies change
		return () => {
			socket.off("receivedTask", handleReceivedTask);
		};
	}, [socket, currentUser.id, addReceivedTasks]); // Only re-run when socket or currentUser.id changes

	return (
		<div className='overflow-y-auto max-h-screen pb-10 p-3'>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[50vh] mt-20 '>
				{/* Timer display */}
				<div className='flex flex-col items-center border border-slate-300 shadow rounded-xl w-full h-full justify-center'>
					<div className='text-2xl md:text-4xl lg:text-6xl text-slate-600 font-bold'>
						{isActive
							? formatTime(startTime)
							: formatTime("")}
					</div>
					{/* Timer control buttons */}
					{!isTrackerTimeLoading && (
						<>
							<div className='flex justify-center gap-4 mt-5'>
								<button
									className='p-3 bg-blue-500 hover:bg-blue-400 disabled:hover:bg-slate-400 disabled:bg-slate-500 text-white rounded-full'
									onClick={startTimer}
									disabled={isActive}>
									<Play
										size={24}
										onClick={() =>
											handleTime(
												"start",
											)
										}
									/>
								</button>

								<button
									className='p-3 bg-red-500 text-white hover:bg-red-400 rounded-full'
									onClick={stopTimer}>
									<StopCircle
										size={24}
										onClick={() =>
											handleTime(
												"stop",
											)
										}
									/>
								</button>
							</div>
						</>
					)}
				</div>

				{/* Task List Section */}
				<div className='flex p-3 justify-center border h-full w-full border-slate-300 shadow rounded-xl '>
					<div className='flex flex-col gap-2 items-center   w-full'>
						{currentTasks
							? currentTasks.map((task: any) => (
									<TaskItem task={task} />
							  ))
							: "No Task Assigned"}
					</div>
				</div>
			</div>
			<div className='border flex flex-col border-slate-300 shadow rounded-xl w-full h-full items-center mt-3'>
				{!isHistoryLoading && history && (
					<TrackerHistory data={history} />
				)}
			</div>
		</div>
	);
};

export default UserTracker;
