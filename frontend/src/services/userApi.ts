import { UserFormData } from "@/interface/user";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// /edit-profile
const axiosInstance = axios.create({
	baseURL: "http://localhost:5000/user",
	// headers: { "Content-Type": "application/json" },
	withCredentials: true,
});

export interface AuthResponse {
	message: string;
	user: any;
}
export const addUser = async (user: FormData): Promise<AuthResponse> => {
	try {
		const response = await axiosInstance.post<AuthResponse>(
			"/add",
			user,
			{ headers: { "Content-Type": "multipart/form-data" } },
		);

		// ✅ Ensure a valid response is returned
		if (!response.data) {
			throw new Error("Invalid response from server.");
		}

		return response.data;
	} catch (err) {
		if (axios.isAxiosError(err) && err.response?.data?.message) {
			console.error("Error:", err.response.data.message);
			throw new Error(err.response.data.message);
		}
		throw new Error("An unexpected error occurred.");
	}
};

export const getUser = async (
	id: string,
): Promise<AuthResponse | undefined> => {
	try {
		const response = await axiosInstance.get<AuthResponse>(
			`/user/${id}`,
		);
		console.log(id);
		// ✅ Ensure a valid response is returned
		if (!response.data) {
			throw new Error("Invalid response from server.");
		}
		return response.data;
	} catch (err) {
		if (err instanceof axios.AxiosError) {
			console.log(err.response?.data.message);

			throw new Error(err.response?.data.message);
		}
		if (err instanceof Error) {
			throw new Error(err.message);
		}
	}
};

export const deleteUser = async (id: string) => {
	try {
		const response = await axiosInstance.delete(`/delete/${id}`);
		console.log("id:", id);
		if (!response.data) {
			throw new Error("Invalid response from server.");
		}
		return response.data;
	} catch (err) {
		if (err instanceof axios.AxiosError) {
			console.log(err.response?.data.message);

			throw new Error(err.response?.data.message);
		}
		if (err instanceof Error) {
			throw new Error(err.message);
		}
	}
};

export const getAllUser = async () => {
	try {
		const response = await axiosInstance.get(`/all`);
		if (!response.data) {
			throw new Error("Invalid response from server.");
		}
		return response.data;
	} catch (err) {
		if (err instanceof axios.AxiosError) {
			console.log(err.response?.data.message);

			throw new Error(err.response?.data.message);
		}
		if (err instanceof Error) {
			throw new Error(err.message);
		}
	}
};

export const getUserReport = async (id: string) => {
	try {
		const response = await axiosInstance.get(`/report/${id}`);
		if (!response.data) {
			throw new Error("Invalid response from server.");
		}
		return response.data;
	} catch (err) {
		if (err instanceof axios.AxiosError) {
			console.log(err.response?.data.message);

			throw new Error(err.response?.data.message);
		}
		if (err instanceof Error) {
			throw new Error(err.message);
		}
	}
};

export const getUsersForProject = async () => {
	try {
		const response = await axiosInstance.get(`/project`);
		if (!response.data) {
			throw new Error("Invalid response from server.");
		}
		return response.data;
	} catch (err) {
		if (err instanceof axios.AxiosError) {
			console.log(err.response?.data.message);

			throw new Error(err.response?.data.message);
		}
		if (err instanceof Error) {
			throw new Error(err.message);
		}
	}
};

export const getDashboardData = async () => {
	try {
		const response = await axiosInstance.get(`/dashboard`);
		if (!response.data) {
			throw new Error("Invalid response from server.");
		}
		return response.data;
	} catch (err) {
		if (err instanceof axios.AxiosError) {
			console.log(err.response?.data.message);

			throw new Error(err.response?.data.message);
		}
		if (err instanceof Error) {
			throw new Error(err.message);
		}
	}
};
export const editUser = async (user: FormData) => {
	try {
		const response = await axiosInstance.put(`/edit`, user, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		if (!response.data) {
			throw new Error("Invalid response from server.");
		}
		return response.data;
	} catch (err) {
		if (err instanceof axios.AxiosError) {
			console.log(err.response?.data.message);

			throw new Error(err.response?.data.message);
		}
		if (err instanceof Error) {
			throw new Error(err.message);
		}
	}
};

export const updateUserProfile = async (
	user: FormData,
): Promise<AuthResponse> => {
	try {
		const response = await axiosInstance.put<AuthResponse>(
			"/edit-profile",
			user,
			{ headers: { "Content-Type": "multipart/form-data" } },
		);

		// ✅ Ensure a valid response is returned
		if (!response.data) {
			throw new Error("Invalid response from server.");
		}

		return response.data;
	} catch (err) {
		if (axios.isAxiosError(err) && err.response?.data?.message) {
			console.error("Error:", err.response.data.message);
			throw new Error(err.response.data.message);
		}
		throw new Error("An unexpected error occurred.");
	}
};

export function useGetUser(id: string) {
	return useQuery({
		queryKey: ["getUser", id],
		queryFn: () => getUser(id),
		retry: false,
	});
}

export function useGetAllUser() {
	return useQuery({
		queryKey: ["getAllUser"],
		queryFn: () => getAllUser(),
		retry: false,
	});
}
export function useGetUsersForProject() {
	return useQuery({
		queryKey: ["getUsersForProject"],
		queryFn: () => getUsersForProject(),
		retry: false,
	});
}
export function useDeleteUser(id: string) {
	return useQuery({
		queryKey: ["deleteUser", id],
		queryFn: () => deleteUser(id),
		retry: false,
	});
}

export function useGetUserReport(id: string) {
	return useQuery({
		queryKey: ["getUserReport", id],
		queryFn: () => getUserReport(id),
		retry: false,
	});
}

export function useGetDashboardData() {
	return useQuery({
		queryKey: ["useGetDashboardData"],
		queryFn: () => getDashboardData(),
		retry: false,
	});
}
