<script lang="ts">
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import Copy from 'lucide-svelte/icons/copy';
	import { onMount } from "svelte";
	import File from 'lucide-svelte/icons/file';

	import ListFilter from 'lucide-svelte/icons/list-filter';
	import EllipsisVertical from 'lucide-svelte/icons/ellipsis-vertical';

	import Truck from 'lucide-svelte/icons/recycle';

	import { Badge } from '$lib/components/ui/badge';
	import RecommendationModal from '$lib/components/ui/applicationOutput.svelte'

	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	import * as Pagination from '$lib/components/ui/pagination';
	import { Progress } from '$lib/components/ui/progress';
	import { Separator } from '$lib/components/ui/separator';
	import { applications, fetchAllApplications } from "../(data)/applications";
	import * as Table from '$lib/components/ui/table';
	import * as Tabs from '$lib/components/ui/tabs';
	import { writable, get } from 'svelte/store';

	let isModalOpen = writable(false);

	let selectedFilter = "All"; // Default filter
	let selectedApplication = writable(null); // Store selected application details

	// 🔹 Fetch Applications on Load
	onMount(async () => {
		await fetchAllApplications();
		applications.subscribe((apps) => {
			console.log("📌 Loaded Applications:", apps);
		});
	});

	// 🔹 Filter Logic
	$: filteredApplications = $applications.filter(app =>
		selectedFilter === "All" || app.status === selectedFilter
	);
	function formatDate(timestamp) {
		if (!timestamp) return "N/A"; // Handle missing values

		const date = new Date(timestamp.seconds * 1000); // Convert Firestore timestamp to JS Date
		return date.toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "long",
			year: "numeric",
		});
	}
	// 🔹 Select Application
	function selectApplication(app) {
		selectedApplication.set(app);
		console.log("✅ Selected Application:", get(selectedApplication)?.businessName); // Debugging log
	}

	function openRecommendationModal() {
		const app = get(selectedApplication);

		if (app?.applicationID) {
			console.log("📌 Opening Modal for Application ID:", app.applicationID);

			// Ensure we reset the state before opening
			isModalOpen.set(false);
			setTimeout(() => isModalOpen.set(true), 10); // Small delay to allow Svelte reactivity to process the change
		} else {
			console.warn("⚠️ No valid application selected");
		}
	}


	// 🔹 Close Modal
	function closeModal() {
		isModalOpen.set(false);
	}

</script>

<div class="flex min-h-screen w-full flex-col">
	<div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
		<main
			class="grid flex-1 items-start gap-3 p-2 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3"
		>
			<div class="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
				<div
					class="flex flex-row gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
				>
					<Card.Root class="flex flex-col items-center gap-4 p-2 sm:col-span-2">
						<Card.Header class="text-center">
							<Card.Title>All Applications</Card.Title>
						</Card.Header>
						<div class="flex flex-row gap-2 p-1">
							<Card.Root>
								<Card.Header class="pb-2 text-center">
									<Card.Description>Accepted</Card.Description>
									<Card.Title class="text-4xl">14</Card.Title>
								</Card.Header>
							</Card.Root>
							<Card.Root>
								<Card.Header class="pb-2 text-center">
									<Card.Description>Rejected</Card.Description>
									<Card.Title class="text-4xl">8</Card.Title>
								</Card.Header>
							</Card.Root>
						</div>
					</Card.Root>
					<Card.Root>
						<Card.Header class="pb-2">
							<Card.Description>This Week</Card.Description>
							<Card.Title class="text-4xl">14</Card.Title>
						</Card.Header>
						<Card.Content>
							<div class="text-xs text-muted-foreground">+25% from last week</div>
						</Card.Content>
						<Card.Footer>
							<Progress value={25} aria-label="25% increase" />
						</Card.Footer>
					</Card.Root>
					<Card.Root>
						<Card.Header class="pb-2">
							<Card.Description>This Month</Card.Description>
							<Card.Title class="text-3xl">29</Card.Title>
						</Card.Header>
						<Card.Content>
							<div class="text-xs text-muted-foreground">+10% from last month</div>
						</Card.Content>
						<Card.Footer>
							<Progress value={12} aria-label="12% increase" />
						</Card.Footer>
					</Card.Root>
				</div>
				<Tabs.Root value="week">
					<div class="flex items-center">
						<Tabs.List>
							<Tabs.Trigger value="day">Day</Tabs.Trigger>
							<Tabs.Trigger value="week">Week</Tabs.Trigger>
							<Tabs.Trigger value="month">Month</Tabs.Trigger>
						</Tabs.List>
						<div class="ml-auto flex items-center gap-2">
							<DropdownMenu.Root>
								<DropdownMenu.Trigger asChild let:builder>
									<Button variant="outline" size="sm" class="h-7 gap-1 text-sm" builders={[builder]}>
										<ListFilter class="h-3.5 w-3.5" />
										<span class="sr-only sm:not-sr-only">Filter</span>
									</Button>
								</DropdownMenu.Trigger>
								<DropdownMenu.Content align="end">
									<DropdownMenu.Label>Filter by</DropdownMenu.Label>
									<DropdownMenu.Separator />
									<DropdownMenu.CheckboxItem checked={selectedFilter === 'Accepted'} on:click={() => selectedFilter = "Accepted"}>Accepted</DropdownMenu.CheckboxItem>
									<DropdownMenu.CheckboxItem checked={selectedFilter === 'Declined'} on:click={() => selectedFilter = "Declined"}>Declined</DropdownMenu.CheckboxItem>
									<DropdownMenu.CheckboxItem checked={selectedFilter === 'All'} on:click={() => selectedFilter = "All"}>All</DropdownMenu.CheckboxItem>
								</DropdownMenu.Content>
							</DropdownMenu.Root>

							<Button size="sm" variant="outline" class="h-7 gap-1 text-sm">
								<File class="h-3.5 w-3.5" />
								<span class="sr-only sm:not-sr-only">Export</span>
							</Button>
						</div>
					</div>
					<Tabs.Content value="week">
						<Card.Root>
							<Card.Header class="mb-2 px-7">
								<Card.Title>Applications</Card.Title>
								<Card.Description>Recent Applications.</Card.Description>
							</Card.Header>
							<Card.Content>
								<Table.Root>
									<Table.Header>
										<Table.Row>
											<Table.Head>Applicant</Table.Head>
											<Table.Head class="hidden sm:table-cell">Sector</Table.Head>
											<Table.Head class="hidden sm:table-cell">Status</Table.Head>
											<Table.Head class="hidden md:table-cell">Date</Table.Head>
											<Table.Head class="text-right">Program</Table.Head>
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{#each filteredApplications as app}
											<Table.Row  class="{$selectedApplication?.name === app.name ? 'bg-accent' : ''} cursor-pointer hover:bg-accent " on:click={() => selectApplication(app)} >
												<Table.Cell>
													<div class="font-medium">{app.name}</div>
													<div class="hidden text-sm text-muted-foreground md:inline">{app.email}</div>
												</Table.Cell>
												<Table.Cell class="hidden sm:table-cell">{app.natureOfBusiness}</Table.Cell>
												<Table.Cell class="hidden sm:table-cell">
													<Badge class="text-xs" variant={app.applicationStatus === "Accepted" ? "secondary" : "outline"}>
														{app.applicationStatus}
													</Badge>
												</Table.Cell>
												<Table.Cell class="hidden md:table-cell">
													{new Date(app.submittedAt.seconds * 1000).toISOString().split("T")[0]}
												</Table.Cell>

												<Table.Cell class="hidden sm:table-cell">{app.programName}</Table.Cell>
												<Table.Cell>
													<Button size="sm" variant='outline' on:click={() => openRecommendationModal()}>Recommendation</Button>
													<RecommendationModal
														isOpen={$isModalOpen} application={$selectedApplication} on:close={() => isModalOpen.set(false)}
													/>
												</Table.Cell>
											</Table.Row>
										{/each}
									</Table.Body>
								</Table.Root>
							</Card.Content>
						</Card.Root>
					</Tabs.Content>
				</Tabs.Root>
			</div>
			<div>
				<Card.Root class="overflow-hidden">
					<Card.Header class="flex flex-row items-start bg-muted/50">
						<div class="grid gap-0.5">
							<Card.Title class="group flex items-center gap-2 text-lg">
								{$selectedApplication?.applicationID}
								<Button
									size="icon"
									variant="outline"
									class="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
								>
									<Copy class="h-3 w-3" />
									<span class="sr-only">Copy Application ID</span>
								</Button>
							</Card.Title>
							<Card.Description class="mb-2">
								Date: {formatDate($selectedApplication?.submittedAt)}
							</Card.Description>
						</div>
						<div class="ml-auto flex items-center gap-1">
							<Button size="sm" variant="outline" class="h-8 gap-1">
								<Truck class="h-3.5 w-3.5" />
								<span class="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
									Change Status
								</span>
							</Button>
						</div>
					</Card.Header>
					<Card.Content class="p-6 text-sm">
						<div class="grid gap-3">
							<div class="font-semibold">Application Details</div>
							<ul class="grid gap-3">
								<li class="flex items-center justify-between">
									<span class="text-muted-foreground"> Business Name </span>
									<span>{$selectedApplication?.businessName}</span>
								</li>
								<li class="flex items-center justify-between">
									<span class="text-muted-foreground"> Sector </span>
									<span>{$selectedApplication?.natureOfBusiness}</span>
								</li>
								<li class="flex items-center justify-between">
									<span class="text-muted-foreground"> Growth Rate</span>
									<span>{$selectedApplication?.growthRate}</span>
								</li>
								<li class="flex items-center justify-between">
									<span class="text-muted-foreground"> Previous Year Revenue </span>
									<span>{$selectedApplication?.annualTurnover}</span>
								</li>
								<li class="flex items-center justify-between">
									<span class="text-muted-foreground"> Past Four Months Turnover </span>
									<span>{$selectedApplication?.annualTurnover}</span>
								</li>
								<li class="flex items-center justify-between">
									<span class="text-muted-foreground"> Number Of Workers</span>
									<span>{$selectedApplication?.employees}</span>
								</li>

							</ul>
							<Separator class="my-4" />
							<div class="grid gap-3">
								<div class="font-semibold">Applicant Information</div>
								<dl class="grid gap-3">
									<div class="flex items-center justify-between">
										<dt class="text-muted-foreground">Applicant</dt>
										<dd>{$selectedApplication?.name}</dd>
									</div>
									<div class="flex items-center justify-between">
										<dt class="text-muted-foreground">Email</dt>
										<dd>
											<a href="mailto:">{$selectedApplication?.email}</a>
										</dd>
									</div>
									<div class="flex items-center justify-between">
										<dt class="text-muted-foreground">Phone</dt>
										<dd>
											<a href="tel:">{$selectedApplication?.phoneNumber}</a>
										</dd>
									</div>
								</dl>
							</div>
							<Separator class="my-4" />
							<div class="grid grid-cols-2 gap-4">
								<div class="grid gap-3">
									<div class="font-semibold">Address Information</div>
									<address class="grid gap-0.5 not-italic text-muted-foreground">
										<span>{$selectedApplication?.name}</span>
										<span>{$selectedApplication?.businessAddress}</span>
									</address>
								</div>
							</div>
						</div></Card.Content
					>
					<Card.Footer class="bApplication-t flex flex-row items-center bg-muted/50 px-6 py-3">
						<div class="text-xs text-muted-foreground">
							Updated <time dateTime="2023-11-23">November 23, 2023</time>
						</div>
						<Pagination.Root count={10} class="ml-auto mr-0 w-auto">
							<Pagination.Content>
								<Pagination.Item>
									<Button size="icon" variant="outline" class="h-6 w-6">
										<ChevronLeft class="h-3.5 w-3.5" />
										<span class="sr-only">Previous Application</span>
									</Button>
								</Pagination.Item>
								<Pagination.Item>
									<Button size="icon" variant="outline" class="h-6 w-6">
										<ChevronRight class="h-3.5 w-3.5" />
										<span class="sr-only">Next Application</span>
									</Button>
								</Pagination.Item>
							</Pagination.Content>
						</Pagination.Root>
					</Card.Footer>
				</Card.Root>
			</div>
		</main>
	</div>
</div>
