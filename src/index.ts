// Import third party libraries.
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Plotly from "plotly.js-dist-min";
import { formatDateWithDay } from "./utils";
import admissionsAboveAverageData from "./data/Filtered_Admissions_Above_Average_with_Loc.json";
import admissionsForecastData from "./data/Filtered_All_Hospitals_Admissions_Forecast.json";
import dischargesForecastData from "./data/Filtered_All_Hospitals_Discharges_Forecast.json";
import losForecastData from "./data/Filtered_All_Hospitals_LOS_Forecast.json";
import bedOccupancyForecastData from "./data/Filtered_Bed_Occupancy_Forecast.json";

// Types
type AdmissionAboveAverage = {
	hospital_name: string;
	ds: string;
	above_avg: number,
	lat: number,
	long: number
};
type AdmissionForecast = {
	hospital_name: string;
	ds: string;
	yhat: number;
	yhat_lower: number;
	yhat_upper: number;
};
type DischargeForecast = {
	hospital_name: string;
	ds: string;
	yhat: number;
	yhat_lower: number;
	yhat_upper: number;
};
type LOSForecast = {
	hospital_name: string;
	ds: string;
	yhat: number;
	yhat_lower: number;
	yhat_upper: number;
};
type BedOccupancyForecast = {
	ds: string;
	hospital_name: string;
	Admits: number;
	Beds_Occupied: number;
	Beds_Available: number;
	Beds_Total: number;
};

// Typed data sets.
const admissionsAboveAverage = admissionsAboveAverageData as AdmissionAboveAverage[];
const admissionsForecast = admissionsForecastData as AdmissionForecast[];
const dischargesForecast = dischargesForecastData as DischargeForecast[];
const losForecast = losForecastData as LOSForecast[];
const bedOccupancyForecast = bedOccupancyForecastData as BedOccupancyForecast[];

// DOM References.
const [
	$map,
	$hospitalDropdown,
	$submitButton,
	$admissionsGraph,
	$dischargeGraph,
	$admissionsPlotlyGraph,
	$dischargePlotlyGraph,
	$losPlotlyGraph,
	$bedOccupancyTable
] = [
	"map",
	"hospitalDropdown",
	"submitButton",
	"admissionsGraph",
	"dischargeGraph",
	"admissionsPlotlyGraph",
	"dischargePlotlyGraph",
	"losPlotlyGraph",
	"bedOccupancyTable"
].map((elementId) => {
	const $element = document.getElementById(elementId);
	if (!$element) throw new Error(`DOM element '${elementId}' not found.`);
	return $element;
}) as [
		HTMLDivElement,
		HTMLSelectElement,
		HTMLButtonElement,
		HTMLDivElement,
		HTMLDivElement,
		HTMLDivElement,
		HTMLDivElement,
		HTMLDivElement,
		HTMLTableElement
	];

// Find all unique hospital names from the available datasets and populate the dropdown options.
const hospitalNames = Array.from(new Set([
	...admissionsForecast.map((item) => item.hospital_name),
	...dischargesForecast.map((item) => item.hospital_name),
	...losForecast.map((item) => item.hospital_name),
	...bedOccupancyForecast.map((item) => item.hospital_name)
]));
const $options = hospitalNames.map((name) => {
	const $option = document.createElement("option");
	$option.text = name;
	$option.value = name;
	return $option;
});
$hospitalDropdown.append(...$options);

// Determine the latest date in the dataset.
const dates = admissionsAboveAverage.map((item) => item.ds);
const latestDate = dates.reduce((a, b) => (a > b ? a : b));
console.log(`Latest Date in Dataset: ${latestDate}`);
// Filter data based on the latest date and valid lat/lng values.
const filteredData = admissionsAboveAverage.filter(
	(item) =>
		item.ds === latestDate &&
		item.long! >= 45 &&
		item.long! <= 49 &&
		item.lat! >= -125 &&
		item.lat! <= -116
);
console.log(`Filtered Data Count: ${filteredData.length}`);
console.log(`Filtered Data Points: ${filteredData}`);

// Initialize the map.
const map = L.map("map").setView([47.7511, -120.7401], 7); // Centered on Washington State
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
filteredData.forEach((item) => {
	const color = item.above_avg ? "red" : "blue";
	const marker = L.circleMarker([item.long!, item.lat!], {
		color,
		fillColor: color,
		fillOpacity: 0.5,
		radius: 5
	}).addTo(map);
	marker.bindPopup(item.hospital_name);
	marker.on("click", function() {
		const hospitalName = this.getPopup().getContent();
		$hospitalDropdown.value = hospitalName;
	});
});

// Adjusting map bounds to fit all markers.
const group = L.featureGroup(
	filteredData.map((item) => L.circleMarker([item.long!, item.lat!]))
);
map.fitBounds(group.getBounds());

function drawAdmissionsGraph() {
	const selectedHospital = $hospitalDropdown.value;
	const hospitalData = admissionsForecast.filter((item) => item.hospital_name === selectedHospital);

	Plotly.newPlot(
		$admissionsGraph,
		[{
			type: "scatter",
			mode: "lines",
			x: hospitalData.map((item) => item.ds),
			y: hospitalData.map((item) => item.yhat),
			line: { shape: "spline" }
		}],
		{
			title: `Hospital Admissions Forecast - ${selectedHospital}`,
			xaxis: { title: "Date" },
			yaxis: { title: "Admissions Forecast" }
		}
	);

	Plotly.newPlot(
		$admissionsPlotlyGraph,
		[
			{
				type: "scatter",
				mode: "lines",
				x: hospitalData.map((item) => item.ds),
				y: hospitalData.map((item) => item.yhat),
				line: { shape: "spline" },
				name: "Estimate",
				text: hospitalData.map((item) => formatDateWithDay(item.ds))
			},
			{
				type: "scatter",
				mode: "lines",
				x: hospitalData.map((item) => item.ds),
				y: hospitalData.map((item) => item.yhat_lower),
				line: { shape: "spline", color: "green" },
				fill: "tonexty",
				name: "Lower Estimate"
			},
			{
				type: "scatter",
				mode: "lines",
				x: hospitalData.map((item) => item.ds),
				y: hospitalData.map((item) => item.yhat_upper),
				line: { shape: "spline", color: "blue" },
				fill: "tonexty",
				name: "Upper Estimate"
			}
		],
		{
			title: `Hospital Admission Forecast - ${selectedHospital}`,
			xaxis: { title: "Date" },
			yaxis: { title: "Admission Forecast" }
		}
	);
}

function drawDischargesGraph() {
	const selectedHospital = $hospitalDropdown.value;
	const hospitalData = dischargesForecast.filter((item) => item.hospital_name === selectedHospital);

	Plotly.newPlot(
		$dischargeGraph,
		[{
			type: "scatter",
			mode: "lines",
			x: hospitalData.map((item) => item.ds),
			y: hospitalData.map((item) => item.yhat),
			line: { shape: "spline" }
		}],
		{
			title: `Hospital Discharges Forecast - ${selectedHospital}`,
			xaxis: { title: "Date" },
			yaxis: { title: "Discharges Forecast" }
		}
	);

	Plotly.newPlot(
		$dischargePlotlyGraph,
		[{
			type: "scatter",
			mode: "lines",
			x: hospitalData.map((item) => item.ds),
			y: hospitalData.map((item) => item.yhat),
			line: { shape: "spline" },
		}],
		{
			title: `Hospital Discharges Forecast - ${selectedHospital}`,
			xaxis: { title: "Date" },
			yaxis: { title: "Discharges Forecast" }
		}
	);

	Plotly.newPlot(
		$dischargePlotlyGraph,
		[
			{
				type: "scatter",
				mode: "lines",
				x: hospitalData.map((d) => d.ds),
				y: hospitalData.map((d) => d.yhat),
				line: { shape: "spline" },
				name: "Estimate",
				text: hospitalData.map((d) => formatDateWithDay(d.ds)), // Add this line
			},
			{
				type: "scatter",
				mode: "lines",
				x: hospitalData.map((d) => d.ds),
				y: hospitalData.map((d) => d.yhat_lower),
				line: { shape: "spline", color: "green" },
				fill: "tonexty",
				name: "Lower Estimate",
			},
			{
				type: "scatter",
				mode: "lines",
				x: hospitalData.map((d) => d.ds),
				y: hospitalData.map((d) => d.yhat_upper),
				line: { shape: "spline", color: "blue" },
				fill: "tonexty",
				name: "Upper Estimate",
			}
		],
		{
			title: `Hospital Discharge Forecast - ${selectedHospital}`,
			xaxis: { title: "Date" },
			yaxis: { title: "Number of Discharges" },
		}
	);
}

function drawLengthOfStaysGraph() {
	const selectedHospital = $hospitalDropdown.value;
	const hospitalData = losForecast.filter((item) => item.hospital_name === selectedHospital);

	Plotly.newPlot(
		$losPlotlyGraph,
		[{
			type: "scatter",
			mode: "lines",
			x: hospitalData.map((item) => item.ds),
			y: hospitalData.map((item) => item.yhat),
			line: { shape: "spline" },
		}],
		{
			title: `Hospital LOS Forecast - ${selectedHospital}`,
			xaxis: { title: "Date" },
			yaxis: { title: "LOS Forecast" }
		}
	);

	Plotly.newPlot(
		$losPlotlyGraph,
		[
			{
				type: "scatter",
				mode: "lines",
				x: hospitalData.map((d) => d.ds),
				y: hospitalData.map((d) => d.yhat),
				line: { shape: "spline" },
				name: "Estimate",
				text: hospitalData.map((d) => formatDateWithDay(d.ds)), // Add this line
			},
			{
				type: "scatter",
				mode: "lines",
				x: hospitalData.map((d) => d.ds),
				y: hospitalData.map((d) => d.yhat_lower),
				line: { shape: "spline", color: "green" },
				fill: "tonexty",
				name: "Lower Estimate",
			},
			{
				type: "scatter",
				mode: "lines",
				x: hospitalData.map((d) => d.ds),
				y: hospitalData.map((d) => d.yhat_upper),
				line: { shape: "spline", color: "blue" },
				fill: "tonexty",
				name: "Upper Estimate",
			}
		],
		{
			title: `Hospital LOS Forecast - ${selectedHospital}`,
			xaxis: { title: "Date" },
			yaxis: { title: "LOS Forecast - Hours" },
		}
	);
}

function populateBedOccupancyTable() {
	const selectedHospital = $hospitalDropdown.value;
	const relevantData = ["2023-10-15", "2023-10-14", "2023-10-16"];
	const filteredData = bedOccupancyForecast.filter((item) => item.hospital_name === selectedHospital && relevantData.includes(item.ds));
	const $tableBody = $bedOccupancyTable.getElementsByTagName("tbody")[0];
	$tableBody.innerHTML = "";
	filteredData.forEach((item) => {
		const row = $tableBody.insertRow();
		const cell1 = row.insertCell(0);
		const cell2 = row.insertCell(1);
		const cell3 = row.insertCell(2);
		const cell4 = row.insertCell(3);
		const cell5 = row.insertCell(4);
		cell1.innerHTML = item.ds;
		cell2.innerHTML = item.hospital_name;
		cell3.innerHTML = item.Beds_Occupied.toString();
		cell4.innerHTML = item.Beds_Available.toString();
		cell5.innerHTML = item.Beds_Total.toString();
	});
}

$submitButton.addEventListener("click", () => {
	drawAdmissionsGraph();
	drawDischargesGraph();
	drawLengthOfStaysGraph();
	populateBedOccupancyTable();
});
