export const convertCapitalizeString = (str: string): string => {
	// Trim the string to remove leading/trailing spaces and handle multiple spaces
	return str
		.trim() // Remove leading and trailing spaces
		.replace(/\s+/g, " ") // Replace multiple spaces with a single space
		.split(" ") // Split the string into words
		.map(
			(word) =>
				word.charAt(0).toUpperCase() +
				word.slice(1).toLowerCase(), // Capitalize the first letter
		)
		.join(" "); // Join the words back into a single string
};
