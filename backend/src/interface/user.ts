export interface UserReqData {
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
	infoUser: boolean | string;
}
