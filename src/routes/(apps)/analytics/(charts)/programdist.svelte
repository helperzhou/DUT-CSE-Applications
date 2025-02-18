<script>
	import { onMount } from "svelte";
	import * as d3 from "d3";

	export let isDashboard = false;

	let width, height;
	$: {
		width = isDashboard ? 250 : 400;
		height = isDashboard ? 250 : 400;
	}

	let svg;
	let isDrilldown = false;
	let selectedProgram = null;
	let legendData = [];

	// ✅ Initial Data: Applications per Program
	const programData = [
		{ program: "Incubation", applications: 120 },
		{ program: "Ideation", applications: 95 },
	];

	// ✅ Drilldown Data: Accepted vs Declined
	const acceptanceData = {
		"Incubation": [
			{ program: "Accepted", applications: 80 },
			{ program: "Declined", applications: 40 }
		],
		"Ideation": [
			{ program: "Accepted", applications: 60 },
			{ program: "Declined", applications: 35 }
		]
	};

	// ✅ Custom Colors for Pie & Legend
	const customColors = {
		"Incubation": "deepskyblue",
		"Ideation": "lightgreen",
		"Mentorship": "lightcoral",
		"Accepted": "deepskyblue",
		"Declined": "crimson"
	};

	onMount(() => {
		const radius = Math.min(width, height) / 2;
		const innerRadius = radius * 0.5;
		const pie = d3.pie().value(d => d.applications);
		const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius);

		svg = d3.select("#pie")
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform", `translate(${width / 2}, ${height / 2})`);

		function updateChart(data, isDrill) {
			isDrilldown = isDrill;
			console.log("Updating Chart with Data:", JSON.stringify(data, null, 2)); // ✅ Debugging

			// ✅ Ensure selectedProgram is correctly set
			if (!isDrilldown) {
				console.log("Main View Selected");
			} else {
				console.log("Drilldown View Selected for:", selectedProgram);
			}

			// ✅ Update Legend with Correct Labels and Colors
			legendData = data.map(d => ({
				label: d.program,
				color: customColors[d.program] || "gray"
			}));


			// ✅ Update Pie Data
			const pieData = pie(data);
			const paths = svg.selectAll("path").data(pieData);


			paths.enter()
				.append("path")
				.attr("d", arc)
				.attr("fill", d => customColors[d.data.program] || "gray")
				.attr("stroke", "transparent")
				.attr("stroke-width", 2)
				.on("click", function (event, d) {  // ✅ Ensure correct binding
					if (!isDrilldown) {
						selectedProgram = d.data.program;
						updateChart(acceptanceData[selectedProgram], true);
					}
				})
				.merge(paths)
				.transition().duration(750)
				.attr("d", arc)
				.attr("fill", d => customColors[d.data.program] || "gray"); // ✅ Update color on drilldown


			paths.exit().remove();

			// ✅ Update Legend
			const legend = d3.select("#legend").selectAll(".legend-item").data(legendData);

			legend.enter()
				.append("div")
				.attr("class", "legend-item")
				.style("display", "flex")
				.style("align-items", "center")
				.style("gap", "8px")
				.style("margin-bottom", "5px")
				.merge(legend)
				.html(d => `<div style="width: 12px; height: 12px; background-color: ${d.color};"></div> <span>${d.label}</span>`);

			legend.exit().remove();
		}

		// ✅ Initial Render
		updateChart(programData, false);

		// ✅ Center Circle for Reset
		svg.append("circle")
			.attr("r", innerRadius * 0.9)
			.attr("fill", "transparent")
			.on("click", () => {
				console.log("Resetting to Main View");
				updateChart(programData, false);
			});
	});
</script>

<div style="display: flex; gap: 20px;">
	<svg id="pie"></svg>
	<div id="legend"></div> <!-- ✅ Legend Now Uses Custom Colors -->
</div>
