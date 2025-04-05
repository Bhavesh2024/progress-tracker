export function getTimeDifference(
	start: Date | string,
	end: Date | string,
	includeMonths = false,
) {
	const startDate = new Date(start) as any;
	const endDate = new Date(end) as any;

	let diffMs = endDate - startDate; // Total difference in milliseconds

	// Calculate components
	const months = includeMonths
		? Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30))
		: 0;
	if (includeMonths) diffMs -= months * (1000 * 60 * 60 * 24 * 30);

	const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
	diffMs -= days * (1000 * 60 * 60 * 24);

	const hours = Math.floor(diffMs / (1000 * 60 * 60));
	diffMs -= hours * (1000 * 60 * 60);

	const minutes = Math.floor(diffMs / (1000 * 60));
	diffMs -= minutes * (1000 * 60);

	const seconds = Math.floor(diffMs / 1000);

	// Create a formatted string dynamically
	const parts = [];
	if (includeMonths && months > 0)
		parts.push(`${months} month${months !== 1 ? "s" : ""}`);
	if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
	if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
	if (minutes > 0)
		parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
	if (seconds > 0)
		parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`);

	return parts.length > 0 ? parts.join(", ") : "0 seconds";
}
