/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		domains: ["localhost"], // Allow images from localhost
		remotePatterns: [
			{
				protocol: "http",
				hostname: "localhost",
				port: "5000", // Specify your backend port
				pathname: "/uploads/user/**", // Allow all user uploads
			},
		],
	},
};

module.exports = nextConfig;
