<script lang="ts">
	import { scaleLinear } from 'd3-scale';

	// 🔹 Generate daily data dynamically (e.g., Day 1, Day 2, etc.)
	const data = Array.from({ length: 30 }, (_, i) => ({
		name: `Day ${i + 1}`,
		total: Math.floor(Math.random() * 5000) + 1000
	}));

	const xTicks = data.map((d) => d.name);
	const yTicks = [0, 1500, 3000, 4500, 6000];
	const padding = { top: 20, right: 15, bottom: 40, left: 45 };

	let width = 1200; // 🔹 Increased width for scrolling effect
	let height = 400;

	function formatMobile(tick: number | string) {
		return tick.toString();
	}

	// 🔹 X Scale: Maps index position to screen width
	$: xScale = scaleLinear()
		.domain([0, xTicks.length])
		.range([padding.left, width - padding.right]);

	// 🔹 Y Scale: Maps value height
	$: yScale = scaleLinear()
		.domain([0, Math.max.apply(null, yTicks)])
		.range([height - padding.bottom, padding.top]);

	$: innerWidth = width - (padding.left + padding.right);
	$: barWidth = innerWidth / xTicks.length - 5; // 🔹 Increased space between bars
</script>

<!-- 🔹 Scrollable container with hidden scrollbar -->
<div class="chart-container">
	<div class="chart">
		<svg width={width} height={height}>
			<!-- Y-Axis -->
			<g class="axis y-axis">
				{#each yTicks as tick}
					<g transform="translate(0, {yScale(tick)})">
						<text stroke="none" font-size="12" fill="#888888" text-anchor="end" x="40" y="-4">
							<tspan>{tick}</tspan>
						</text>
					</g>
				{/each}
			</g>

			<!-- X-Axis -->
			<g class="axis x-axis">
				{#each data as point, i}
					<g transform="translate({xScale(i)}, {height - padding.bottom})">
						<text
							stroke="none"
							font-size="12"
							fill="#888888"
							text-anchor="middle"
							x={barWidth / 2}
							y="15"
						>
							<tspan>{point.name}</tspan>
						</text>
					</g>
				{/each}
			</g>

			<!-- Bars -->
			<g>
				{#each data as point, i}
					<rect
						class="bg-primary-foreground"
						x={xScale(i)}
						y={yScale(point.total)}
						width={barWidth}
						height={yScale(0) - yScale(point.total)}
						fill="deepskyblue"
						rx="4"
						ry="4"
					/>
				{/each}
			</g>
		</svg>
	</div>
</div>

<style>
    .chart-container {
        overflow-x: auto; /* 🔹 Enables horizontal scrolling */
        width: 100%;
        padding-bottom: 10px;

        /* 🔹 Hides scrollbar for WebKit browsers */
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* Internet Explorer 10+ */
    }

    .chart-container::-webkit-scrollbar {
        display: none; /* 🔹 Hides scrollbar for Chrome, Safari, and Edge */
    }

    .chart {
        display: inline-block;
    }

    svg {
        position: relative;
    }

    rect {
        max-width: 45px; /* 🔹 More space between bars */
    }

    .axis text {
        font-size: 12px;
    }
</style>
