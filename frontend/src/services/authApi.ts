import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const axiosInstance = axios.create({
	baseURL: "http://localhost:5000/user/auth",
	headers: { "Content-Type": "application/json" },
	withCredentials: true,
});

export interface AuthResponse {
	message: string;
	mailStatus: string;
	data: any;
}
export const loginUser = async (user: {
	username: string;
	password: string;
	role: string;
}): Promise<AuthResponse> => {
	try {
		const response = await axiosInstance.post<AuthResponse>(
			"/login",
			user,
		);

		// ✅ Ensure a valid response is returned
		if (!response.data) {
			throw new Error("Invalid response from server.");
		}

		return response.data;
	} catch (err) {
		if (axios.isAxiosError(err) && err.response?.data?.message) {
			console.error("Login error:", err.response.data.message);
			throw new Error(err.response.data.message);
		}
		throw new Error("An unexpected error occurred.");
	}
};

export const checkLogin = async (
	role: string,
): Promise<AuthResponse | undefined> => {
	try {
		const response = await axiosInstance.get<AuthResponse>("/login", {
			params: {
				userRole: role,
			},
		});
		console.log(role);
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

export const handleVerification = async (role: string, email: string) => {
	try {
		const response = await axiosInstance.post(`/verification`, {
			email,
			role,
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

export const handleForgotPassword = async (
	role: string,
	email: string,
	password: string,
) => {
	try {
		const response = await axiosInstance.post(`/forgot-password`, {
			email,
			password,
			role,
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

export const verifyUser = async (role: string, token: string) => {
	try {
		const response = await axiosInstance.get(
			`/${role}/verify/${token}`,
		);
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

export const handleCodeVerification = async (role: string, code: number) => {
	try {
		const response = await axiosInstance.post(`/code-verification`, {
			code,
			role,
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

export const resendOTP = async (role: string) => {
	try {
		const response = await axiosInstance.post("/send-otp", {
			role,
		});
		if (!response.data) {
			throw new Error("You have reached Daily Limit");
		}
		return response.data;
	} catch (err) {
		if (err instanceof axios.AxiosError) {
			if (err.response?.status == 429) {
				throw new Error("You have reached Daily Limit");
			}
			throw new Error(err.response?.data.message);
		}
		if (err instanceof Error) {
			throw new Error(err.message);
		}
	}
};

export const logoutUser = async (role: string) => {
	try {
		const response = await axiosInstance.post("/logout", {
			role,
		});
		if (!response.data) {
			throw new Error("Logout Failed");
		}
		return response.data;
	} catch (err) {
		if (err instanceof axios.AxiosError) {
			throw new Error(err.response?.data.message);
		}
		if (err instanceof Error) {
			throw new Error(err.message);
		}
	}
};

export function useCheckLogin(role: string) {
	return useQuery({
		queryKey: ["checkLogin", role],
		queryFn: () => checkLogin(role),
		retry: false, // No retry if user is unauthenticated
	});
}

export function useVerifyUser(role: string, token: string) {
	return useQuery({
		queryKey: ["verifyUser", role],
		queryFn: () => verifyUser(role, token),
		retry: false,
	});
}
