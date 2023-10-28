document.addEventListener("DOMContentLoaded", function () {
  // Populate the dropdown with unique hospital names
  let dropdown = document.getElementById("hospital-dropdown");
  let hospitalNames = [
    "Mid Val Hosp",
    "Fairfax Behavioral Health Everett",
    "Pullman Reg Hosp",
    "St. Joseph Med Ctr",
    "North Val Hosp",
    "Quincy Val Med Center",
    "PH United General Med Ctr",
    "Providence St. Lukes Rehabilitation Medical Center",
    "Prov St Josephs Hosp",
    "Smokey Point Behav Hospital",
    "Fairfax Behavioral Health Kirkland",
    "MultiCare Mary Bridge Childrens Hospital and Health Center",
    "PH Peace Island Medical Center",
    "Astria Toppenish Hospital",
    "Astria Sunnyside Hospital",
    "BEH",
    "MultiCare Capital Med Ctr",
    "RUR",
    "Lake Chelan Comm Hosp and Clinics",
    "Newport Hospital and Health Services",
    "PH St Joseph Medical Center",
    "Kindred Hospital Seattle",
    "Kaiser Permanente Central Hospital",
    "Forks Comm Hosp",
    "Prov Rgnl Med Ctr Everett",
    "St. Anthony Hospital",
    "Lincoln Hosp",
    "Seattle Childrens Hospital",
    "Snoqualmie Val Hosp District",
    "Prov Holy Family Hosp",
    "Multicare Auburn Med Ctr",
    "Skyline Hosp",
    "Cascade Val Hosp",
    "PH Southwest MD Ctr",
    "CHI Franciscan Rehabilitation Hospital",
    "Yakima Valley Memorial Hospital",
    "East Adams Rural Healthcare",
    "Prov St Mary Med Ctr",
    "Tri State Mem Hosp",
    "Klickitat Val Community Hosp",
    "Lourdes Counseling Ctr",
    "Mason Gen Hosp and Family of Clinics",
    "Whidbey Health",
    "Samaritan Healthcare",
    "Rainier Springsiatric Hospital",
    "Prov St Peter Hosp",
    "URB",
    "Confluence Health Wenatchee Val Hospital",
    "Skagit Valley Hospital",
    "Columbia County Health System",
    "Swedish Issaquah",
    "Swedish Edmonds",
    "Arbor Health-Morton General",
    "St. Michael Med Ctr Bremerton and Silverdale",
    "Prov Sacred Heart Med Ctr and Childrens Hosp",
    "Multicare Deaconess Hospital",
    "Swedish First Hill-Ballard",
    "Regional Hospital for Respiratory and Complex Care",
    "Grays Harbor Comm Hospital",
    "Navos",
    "Prov Centralia Hosp",
    "Fairfax Behavioral Health Monroe",
    "Prov Mt Carmel Hosp",
    "Olympic Med Ctr",
    "St. Anne Medical Center",
    "UW Medicine Northwest Hosp and Medical Center",
    "Cascade Med Ctr",
    "Legacy Salmon Creek Medical Center",
    "Confluence Health Central WA Hosp",
    "PH St John Med Ctr",
    "Trios Health",
    "Lourdes Med Ctr",
    "Ocean Beach Hospital and Medical Clinics",
    "TRA",
    "Prosser Memorial Hospital",
    "Evergreen Health Kirkland",
    "UW Medicine Valley Med Ctr",
    "CAH",
    "Columbia Basin Hosp",
    "UW Medicine Northwest Hosp",
    "UW Medicine University Of WA Med Ctr and Northwest",
    "Astria Regional Medical Center",
    "Jefferson Healthcare",
    "Overlake Hosp Med Ctr",
    "All",
    "Three Rivers Hospital",
    "Inland Northwest Behavioral Health",
    "Evergreen Health Monroe",
    "St. Clare Hosp",
    "Kadlec Reg Med Ctr",
    "Swedish-Cherry Hill",
    "Shriners Hospital for Children-Spokane Orthopedics Specialists",
    "Willapa Harbor Hosp",
    "Island Hosp",
    "South Sound Behaviroal Hosptial",
    "Coulee Medical Center",
    "Multicare Valley Hospital",
    "Odessa Memorial Healthcare Center",
    "UW Medicine Harborview Med Ctr",
    "Wellfound Behavioral Health Hospital",
    "Multicare Good Samaritan Hosp",
    "Virginia Mason Med Ctr",
    "St. Elizabeth Hosp",
    "Kittitas Valley Healthcare",
    "Ferry Cty Mem Hosp",
    "Cascade Behavioral Hospital",
    "Whitman Hosp and Med Ctr",
    "MultiCare Tacoma Gen Hosp - Allenmore",
    "Multicare Covington Med Ctr",
    "Seattle Cancer Care Alliance",
    "St. Francis Hospital",
    "Othello Comm Hosp",
    "Summit Pacific Med Center",
  ];
  hospitalNames.forEach((name) => {
    let option = document.createElement("option");
    option.value = option.text = name;
    dropdown.add(option);
  });

  // Initial heatmap render
  updateHeatmap();
});

function updateHeatmap() {
  let selectedHospital = document.getElementById("hospital-dropdown").value;

  plotHeatmap("admission-heatmap", AdmitHeatMap, "Admission", selectedHospital);
  plotHeatmap(
    "discharge-heatmap",
    DischargeHeatMap,
    "Discharge",
    selectedHospital,
  );
}

function plotHeatmap(elementId, data, type, selectedHospital) {
  // Filter data for the selected hospital
  let filteredData = data.filter(
    (entry) => entry.hospital_name === selectedHospital,
  );

  // Extract X, Y, and Z values for the heatmap
  let xValues = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  let yValues = Array.from({ length: 24 }, (_, i) => i); // [0, 1, 2, ... 23]

  // Compute Z values (percentage) based on X (day of week) and Y (hour)
  let zValues = yValues.map((hour) => {
    return xValues.map((day) => {
      let entryKey =
        type === "Admission" ? "admit_weekday" : "discharge_weekday";
      let hourKey = type === "Admission" ? "admission_hour" : "discharge_hour";
      let entry = filteredData.find(
        (item) => item[entryKey] === day && item[hourKey] === hour,
      );
      return entry ? entry.percentage : 0;
    });
  });

  // Determine the maximum percentage value
  let maxPercentage = Math.max(...zValues.flat());

  // Plot heatmap using Plotly with the updated properties
  let dataToPlot = [
    {
      x: xValues,
      y: yValues,
      z: zValues,
      type: "heatmap",
      colorscale: "Viridis",
      zmin: 0,
      zmax: maxPercentage,
      colorbar: {
        title: "Percentage: ",
        titleside: "right",
      },
    },
  ];
  let layout = {
    title: type + " Heatmap for " + selectedHospital,
    xaxis: { title: "Day of Week" },
    yaxis: {
      title: "Hour of Day",
      tickvals: yValues,
      ticktext: yValues.map((hour) => hour + ":00"),
    },
  };
  Plotly.newPlot(elementId, dataToPlot, layout);
}
