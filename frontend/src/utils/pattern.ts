export const userDataPattern = {
	name: /^[A-Za-z\s]{1,50}$/,
	email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
	phone: /^\d{10}$/,
	password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$#_@])[A-Za-z\d$#_@]{8,16}$/,
	username: /^[a-z0-9_]{4,16}$/,
	empCode: /^KPYX\d{4}$/,
};

export const projectDataPattern = {
	name: /^[a-zA-Z0-9 _-]{3,50}$/,
};
