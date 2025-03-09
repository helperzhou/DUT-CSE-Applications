<script>
    import { onMount } from "svelte";
    import * as d3 from "d3";
    import { db } from "$lib/firebase";
    import { collection, query, where, getDocs } from "firebase/firestore";

    let width = 1000, height = 400;
    let svg;
    let data = [];

    // ✅ Function to fetch users from Firestore
    async function getUsersWithInterventions() {
        const usersRef = collection(db, "Users");

        // Query users with at least one intervention
        const usersQuery = query(usersRef, where("interventions", "!=", []));
        const querySnapshot = await getDocs(usersQuery);

        let users = [];

        for (const doc of querySnapshot.docs) {
            const userData = doc.data();
            
            // Check for Applications sub-collection
            const applicationsRef = collection(doc.ref, "Applications");
            const applicationsSnapshot = await getDocs(applicationsRef);

            if (!applicationsSnapshot.empty) {
                const mainInterventions = Object.keys(userData.interventions || {});
                
                if (mainInterventions.length > 0) {
                    users.push({
                        id: doc.id,
                        ...userData,
                        interventions: mainInterventions
                    });
                }
            }
        }

        return users;
    }

    // ✅ Fetch and process data
    async function loadData() {
        const users = await getUsersWithInterventions();

        // Count interventions
        let interventionCounts = {};
        users.forEach(user => {
            user.interventions.forEach(intervention => {
                interventionCounts[intervention] = (interventionCounts[intervention] || 0) + 1;
            });
        });

        // Format data for D3.js
        data = Object.entries(interventionCounts).map(([intervention, value]) => ({
            intervention,
            value
        }));

        drawChart();
    }

    // ✅ D3.js Bar Chart
    function drawChart() {
        if (!data.length) return;

        const colorScale = d3.scaleOrdinal()
            .domain(data.map(d => d.intervention))
            .range(["#4CAF50", "#FF9800", "#2196F3", "#E91E63", "#9C27B0", "#FFC107"]); // Different colors for interventions

        // Set up SVG
        svg = d3.select("#chart")
            .attr("width", width)
            .attr("height", height);

        const margin = { top: 20, right: 30, bottom: 50, left: 50 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Scales
        const xScale = d3.scaleBand()
            .domain(data.map(d => d.intervention))
            .range([0, chartWidth])
            .padding(0.4);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .range([chartHeight, 0]);

        // Bars
        g.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.intervention))
            .attr("y", d => yScale(d.value))
            .attr("width", xScale.bandwidth())
            .attr("height", d => chartHeight - yScale(d.value))
            .attr("rx", 5) // Rounded corners
            .attr("fill", d => colorScale(d.intervention))
            .on("mouseover", function () { d3.select(this).attr("opacity", 0.8); })
            .on("mouseout", function () { d3.select(this).attr("opacity", 1); });

        // Y Axis
        g.append("g").call(d3.axisLeft(yScale).ticks(5));

        // Legend
        const legend = svg.append("g")
            .attr("transform", `translate(${width - 120}, ${margin.top})`);

        legend.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 20)
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", d => colorScale(d.intervention));

        legend.selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .attr("x", 20)
            .attr("y", (d, i) => i * 20 + 10)
            .attr("font-size", "12px")
            .attr("fill", "#333")
            .text(d => d.intervention);
    }

    onMount(() => {
        loadData();
    });
</script>

<svg id="chart"></svg>
