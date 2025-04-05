const fs = require("fs");

const userData = fs.readFileSync("./data/user.json", "utf-8");

const addData = (data: any) => {
	const users = JSON.parse(userData);
	const newUser = { ...users, ...data };
	console.log(newUser);
};

const data = {
	KPYX0001: {
		username: "bhavesh",
		password: "bhavesh_1724",
	},
};
addData(data);
