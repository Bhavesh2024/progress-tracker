import { Tracker } from "@/interface/tracker";
import { useQueries, useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

const axiosInstance = axios.create({
	baseURL: `${process.env.NEXT_PUBLIC_SERVER_URL}/user/tracker`,
	withCredentials: true,
});

export const setTrackerTime = async (data: Tracker) => {
	try {
		const response = await axiosInstance.post("/set-time", data);
		if (!response.data) {
			throw new Error("Invalid response from server.");
		}
		return response.data;
	} catch (err) {
		if (err instanceof AxiosError) {
			throw new Error(err.response?.data.message);
		} else if (err instanceof Error) {
			throw new Error(err.message);
		} else {
			throw new Error("Unexpected Error");
		}
	}
};

export const getTrackerTime = async (type: string) => {
	try {
		const response = await axiosInstance.get("/get-time", {
			params: {
				type: type,
			},
		});
		if (!response.data) {
			throw new Error("Invalid response from server.");
		}
		return response.data;
	} catch (err) {
		if (err instanceof AxiosError) {
			throw new Error(err.response?.data.message);
		} else if (err instanceof Error) {
			throw new Error(err.message);
		} else {
			throw new Error("Unexpected Error");
		}
	}
};

export const getTrackerHistory = async (id: string = "") => {
	try {
		const response = await axiosInstance.get("/history", {
			params: {
				userId: id,
			},
		});
		if (!response.data) {
			throw new Error("Invalid response from server.");
		}
		return response.data;
	} catch (err) {
		if (err instanceof AxiosError) {
			throw new Error(err.response?.data.message);
		} else if (err instanceof Error) {
			throw new Error(err.message);
		} else {
			throw new Error("Unexpected Error");
		}
	}
};

export const useGetTrackerTimeQuery = (type: string = "start") =>
	useQuery({
		queryKey: ["getTrackerTime", type],
		queryFn: () => getTrackerTime(type),
		retry: false,
	});
export const useGetTrackerHistoryQuery = (id: string) =>
	useQuery({
		queryKey: ["getTrackerHistory", id],
		queryFn: () => getTrackerHistory(id),
		retry: false,
	});
