import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { Task, TaskDataFormat } from "@/interface/task";

const axiosInstance = axios.create({
	baseURL: `${process.env.NEXT_PUBLIC_SERVER_URL}/task`,
	withCredentials: true,
});

export const addTask = async (task: TaskDataFormat) => {
	try {
		const response = await axiosInstance.post("/add", task);
		if (!response.data) {
			throw new Error("Invalid response from server.");
		}
		return response.data;
	} catch (err) {
		if (err instanceof AxiosError) {
			throw new Error(err.response?.data.message);
		} else if (err instanceof Error) {
			throw new Error(err.message);
		}
	}
};

export const editTask = async (task: TaskDataFormat) => {
	try {
		const response = await axiosInstance.put("/edit", task);
		if (!response.data) {
			throw new Error("Invalid response from server.");
		}
		return response.data;
	} catch (err) {
		if (err instanceof Error) {
			throw new Error(err.message);
		} else if (err instanceof AxiosError) {
			throw new Error(err.response?.data.message);
		}
	}
};

export const getTaskById = async (id: number) => {
	try {
		const response = await axiosInstance.get(`/${id}`);
		if (!response.data) {
			throw new Error("Invalid response from server.");
		}
		return response.data;
	} catch (err) {
		if (err instanceof Error) {
			throw new Error(err.message);
		} else if (err instanceof AxiosError) {
			throw new Error(err.response?.data.message);
		}
	}
};

export const getTaskByMember = async (member: string) => {
	try {
		const response = await axiosInstance.get(`/user/${member}`);
		if (!response.data) {
			throw new Error("Invalid response from server.");
		}
		return response.data;
	} catch (err) {
		if (err instanceof Error) {
			throw new Error(err.message);
		} else if (err instanceof AxiosError) {
			throw new Error(err.response?.data.message);
		}
	}
};

export const getAllTask = async () => {
	try {
		const response = await axiosInstance.get("/all");
		if (!response.data) {
			throw new Error("Invalid response from server.");
		}
		return response.data;
	} catch (err) {
		if (err instanceof Error) {
			throw new Error(err.message);
		} else if (err instanceof AxiosError) {
			throw new Error(err.response?.data.message);
		}
	}
};

export const getMemberProject = async () => {
	try {
		const response = await axiosInstance.get(`/project/member`);
		if (!response.data) {
			throw new Error("Invalid response from server.");
		}
		return response.data;
	} catch (err) {
		if (axios.isAxiosError(err)) {
			console.log("error", err);
			throw new Error(err.response?.data.message);
		} else if (err instanceof Error) {
			throw new Error(err.message);
		}
	}
};

export const getProjectTask = async (code: string | number) => {
	try {
		const response = await axiosInstance.get(`/project/${code}`);
		if (!response.data) {
			throw new Error("Invalid response from server.");
		}
		return response.data;
	} catch (err) {
		if (axios.isAxiosError(err)) {
			console.log("error", err);
			throw new Error(err.response?.data.message);
		} else if (err instanceof Error) {
			throw new Error(err.message);
		}
	}
};

export const getUserCurrentTasks = async (id: string) => {
	try {
		const response = await axiosInstance.get(`/user/current/${id}`);
		if (!response.data) {
			throw new Error("Invalid response from server.");
		}
		return response.data;
	} catch (err) {
		if (err instanceof Error) {
			throw new Error(err.message);
		} else if (err instanceof AxiosError) {
			throw new Error(err.response?.data.message);
		}
	}
};

export const deleteTask = async (id: string) => {
	try {
		const response = await axiosInstance.delete(`/delete/${id}`);
		if (!response.data) {
			throw new Error("Invalid response from server.");
		}
		return response.data;
	} catch (err) {
		if (err instanceof Error) {
			throw new Error(err.message);
		} else if (err instanceof AxiosError) {
			throw new Error(err.response?.data.message);
		}
	}
};

export const useGetTaskById = (id: number) => {
	return useQuery({
		queryKey: ["getTaskById", id],
		queryFn: () => getTaskById(id),
		retry: false,
	});
};

export const useGetTaskByMember = (id: string) => {
	return useQuery({
		queryKey: ["getTaskById", id],
		queryFn: () => getTaskByMember(id),
		retry: false,
	});
};

export const useGetAllTask = () => {
	return useQuery({
		queryKey: ["getAllTask"],
		queryFn: () => getAllTask(),
		retry: false,
	});
};

export const useGetProjectTask = (code: string | number) => {
	return useQuery({
		queryKey: ["getProjectTask"],
		queryFn: () => getProjectTask(code),
		retry: false,
	});
};

export const useGetMemberProject = () => {
	return useQuery({
		queryKey: ["getMemberProject"],
		queryFn: () => getMemberProject(),
		retry: false,
	});
};

export const useGetUserCurrentTask = (id: string) => {
	return useQuery({
		queryKey: ["getUserCurrentTasks", id],
		queryFn: () => getUserCurrentTasks(id),
		retry: false,
	});
};
