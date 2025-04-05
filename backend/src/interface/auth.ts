export interface TokenPayload {
	id: string;
	role: string;
}

export interface VerificationRequestData {
	email: string;
	role: string;
}

export interface MailResponse {
	message: string;
	success: boolean;
	isError: boolean;
}

export interface ForgotPasswordRequestData {
	email: string;
	password: string;
	role: string;
}

export interface ForgotPasswordTokenVerificationData {
	token: string;
	role: string;
}

export interface CodeVerficationData {
	code: number;
	role: string;
}
