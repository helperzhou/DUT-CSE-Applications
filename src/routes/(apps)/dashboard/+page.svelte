<script lang="ts">
	import Activity from 'lucide-svelte/icons/activity';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import CreditCard from 'lucide-svelte/icons/credit-card';
	import DollarSign from 'lucide-svelte/icons/dollar-sign';
	import Users from 'lucide-svelte/icons/user-check';

	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import ApplicationsCharts from '$lib/components/ui/applications-chart/applications-charts.svelte';
	import Programdist from "../analytics/(charts)/programdist.svelte";


</script>
<div class="flex min-h-screen w-full flex-col">
		<main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
			<div class="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Card.Title class="text-sm font-medium">Applications</Card.Title>
						<Users class="h-4 w-4 text-muted-foreground" />
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">+2350</div>
						<p class="text-xs text-muted-foreground">+180.1% from last month</p>
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Card.Title class="text-sm font-medium">Total Revenue</Card.Title>
						<DollarSign class="h-4 w-4 text-muted-foreground" />
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">$45,231.89</div>
						<p class="text-xs text-muted-foreground">+20.1% from last month</p>
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Card.Title class="text-sm font-medium">Average Company Age</Card.Title>
						<CreditCard class="h-4 w-4 text-muted-foreground" />
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">3</div>
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Card.Title class="text-sm font-medium">Average Owner Age</Card.Title>
						<Activity class="h-4 w-4 text-muted-foreground" />
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">28</div>
					</Card.Content>
				</Card.Root>
			</div>
			<div class="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
				<Card.Root class=" xl:col-span-2">
					<Card.Header class="flex flex-row items-center">
						<div class="mb-2 grid gap-2">
							<Card.Title>Applications</Card.Title>
							<Card.Description>Recent applications to the program.</Card.Description>
						</div>
						<Button href="##" size="sm" class="ml-auto gap-1">
							View All
							<ArrowUpRight class="h-4 w-4" />
						</Button>
					</Card.Header>
					<ApplicationsCharts />
				</Card.Root>
				<Card.Root>
					<Card.Header class="flex flex-row items-center">
						<div class="mb-2 grid gap-2">
							<Card.Title>Program Applications</Card.Title>
							<Card.Description>Distribution of applications per program.</Card.Description>
						</div>
						<Button href="##" size="sm" class="ml-auto gap-1">
							View All
							<ArrowUpRight class="h-4 w-4" />
						</Button>
					</Card.Header>
					<div class="flex flex-row p-4 justify-center items-center mt-2">
						<Programdist isDashboard={true} />
					</div>
				</Card.Root>
			</div>
		</main>
	</div>

