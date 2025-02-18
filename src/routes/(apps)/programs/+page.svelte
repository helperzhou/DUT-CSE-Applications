<script lang="ts">
	import { onMount } from "svelte";
	import DataTable from "./(components)/data-table.svelte";
	import UserNav from "./(components)/user-nav.svelte";
	import ProgramSheet from "./(components)/program-sheet.svelte";
	import { selectedProgram } from "./(data)/selectedProgram";
	import { data, fetchPrograms } from "./(data)/programs"; // ✅ Import updated store

	// ✅ Fetch programs when the page loads
	onMount(async () => {
		await fetchPrograms(); // ✅ Ensures data is actually loaded
		data.subscribe((value) => {
			console.log("✅ Programs in UI:", value); // ✅ Check if data is available
		});
	});
</script>

<!-- 🔹 Main UI -->
<div class="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
	<div class="flex items-center justify-between space-y-2">
		<div>
			<h2 class="text-2xl font-bold tracking-tight">Manage Programs</h2>
			<p class="text-muted-foreground">Here's a list of the available programs.</p>
		</div>
		<div class="flex items-center space-x-2">
			{#if $selectedProgram}
				<ProgramSheet />
			{/if}
			<UserNav />
		</div>
	</div>

	<!-- Pass dynamically fetched data to DataTable -->
	<DataTable data={$data} />
</div>
