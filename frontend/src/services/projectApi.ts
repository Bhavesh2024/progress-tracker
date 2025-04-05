import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@/interface/project";

const axiosInstance = axios.create({
	baseURL: `${process.env.NEXT_PUBLIC_SERVER_URL}/user/project`,
	withCredentials: true,
});

export const addProject = async (project: Project) => {
	try {
		const response = await axiosInstance.post("/add", project);
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

export const updateProject = async (project: Project) => {
	try {
		const response = await axiosInstance.put("/edit", project);
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

export const getProject = async (id: string) => {
	try {
		const response = await axiosInstance.get(`/code/${id}`);
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

export const getProjectFromSlug = async (slug: string) => {
	try {
		const response = await axiosInstance.get(`/slug/${slug}`);
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

export const getAllProject = async () => {
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

export const deleteProject = async (id: string) => {
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

export const useGetProject = (id: string) => {
	return useQuery({
		queryKey: ["getProject", id],
		queryFn: () => getProject(id),
		retry: false,
	});
};

export const useGetAllProject = () => {
	return useQuery({
		queryKey: ["getProject"],
		queryFn: () => getAllProject(),
		retry: false,
	});
};

export const useGetProjectFromSlug = (slug: string) => {
	return useQuery({
		queryKey: ["getProjectFromSlug", slug],
		queryFn: () => getProjectFromSlug(slug),
		retry: false,
	});
};
