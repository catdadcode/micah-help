export function formatDateWithDay(dateString) {
	const days = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];
	const date = new Date(dateString);
	const dayOfWeek = days[date.getDay()];
	return `${dateString} (${dayOfWeek})`;
}
