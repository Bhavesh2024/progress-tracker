export interface UserFormData {
	empCode: string;
	image: string | File;
	name: string;
	birthDate: string | Date;
	gender: string;
	email: string;
	phone: string;
	joiningDate: Date | string;
	userRole: string;
	jobRole: string;
	username: string;
	password: string;
	infoUser: boolean;
}
export interface User {
	id: string;
	empCode: string;
	image: string | File;
	name: string;
	birthDate: string | Date;
	gender: string;
	email: string;
	phone: string;
	joiningDate: Date | string;
	userRole: string;
	jobRole: string;
	username: string;
	password: string;
}

export interface CurrentUser {
	id: string;
	empCode: string;
	image: string | File;
	name: string;
	birthDate: string | Date;
	gender: string;
	email: string;
	phone: string;
	joiningDate: Date | string;
	role: string;
	jobRole: string;
	username: string;
}

export interface CurrentUserState {
	currentUser: CurrentUser | any;
	updateCurrentUser: (user: CurrentUser) => void;
}

export interface UserState {
	users: User[];
	addNewUser: (user: User) => void;
	updateUser: (user: User) => void;
	removeUser: (empCode: string) => void;
	clearAllUsers: () => void;
}

export interface UpdateUser {
	id: string;
	username: string;
	name: string;
	phone: string;
	profilePhoto: string | File | null;
	email: string;
}
