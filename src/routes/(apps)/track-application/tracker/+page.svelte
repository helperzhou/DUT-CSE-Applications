<script lang="ts">
	import House from "lucide-svelte/icons/house";
	import ChartLine from "lucide-svelte/icons/chart-line";
	import Package from "lucide-svelte/icons/package";
	import Package2 from "lucide-svelte/icons/package-2";
	import PanelLeft from "lucide-svelte/icons/panel-left";
	import Search from "lucide-svelte/icons/search";
	import Activity from 'lucide-svelte/icons/activity';
	import CreditCard from 'lucide-svelte/icons/credit-card';
	import Users from 'lucide-svelte/icons/user-check';
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Sheet from "$lib/components/ui/sheet/index.js";
	import { auth } from "$lib/firebase"; // Import Firebase Auth
	import { signOut } from "firebase/auth";
	import { goto } from "$app/navigation";
	import ApplicationsTable from "./(components)/applicationsTable.svelte"
	import { get } from 'svelte/store';
	import { writable } from 'svelte/store';
	import { onAuthStateChanged } from "firebase/auth";
	import { db } from "$lib/firebase";
	import { collection, getDocs, query, where } from "firebase/firestore";
	import { onMount } from 'svelte';

	const loggedInUser = writable<{ fullName: string; email: string } | null>(null);

	async function fetchUserData(email: string) {
		try {
			console.log("📌 Fetching Firestore data for:", email);
			const usersRef = collection(db, "Users");
			const q = query(usersRef, where("userEmail", "==", email));
			const querySnapshot = await getDocs(q);

			if (!querySnapshot.empty) {
				const userData = querySnapshot.docs[0].data();
				console.log("✅ Found user in Firestore:", userData);
				loggedInUser.set({ fullName: userData.userFullName, email: userData.userEmail });
				console.log("✅ Logged In User:", get(loggedInUser)?.fullName);
			} else {
				console.warn("⚠️ No user found in Firestore.");
				loggedInUser.set(null);
			}
		} catch (error) {
			console.error("🔥 Error fetching Firestore user data:", error);
		}
	}

	onMount(async () => {
		onAuthStateChanged(auth, async (user) => {
			console.log("🔹 Auth state changed:", user);
			if (user && user.email) {
				console.log("✅ Authenticated user detected:", user.email);
				await fetchUserData(user.email);
			} else {
				console.warn("⚠️ No authenticated user found.");
				loggedInUser.set(null);
			}
		});
	});
	// Handle Logout
	const handleLogout = async () => {
		try {
			await signOut(auth);
			goto("/track-application/signin"); // Redirect after logout
		} catch (error) {
			console.error("Logout error:", error);
		}
	};
	function getUserInitials(name?: string): string {
		return name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?";
	}
</script>
<div class="bg-muted/40 flex min-h-screen w-full flex-col">
	<div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
		<header
			class="bg-background sticky top-0 z-30 flex h-14 items-center gap-4 border-b px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"
		>
			<Sheet.Root>
				<Sheet.Trigger asChild let:builder>
					<Button builders={[builder]} size="icon" variant="outline" class="sm:hidden">
						<PanelLeft class="h-5 w-5" />
						<span class="sr-only">Toggle Menu</span>
					</Button>
				</Sheet.Trigger>
				<Sheet.Content side="left" class="sm:max-w-xs">
					<nav class="grid gap-6 text-lg font-medium">
						<a
							href="##"
							class="bg-primary text-primary-foreground group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full text-lg font-semibold md:text-base"
						>
							<Package2 class="h-5 w-5 transition-all group-hover:scale-110" />
							<span class="sr-only">DUT Applications</span>
						</a>
						<a
							href="/track-application/tracker"
							class="text-muted-foreground hover:text-foreground flex items-center gap-4 px-2.5"
						>
							<House class="h-5 w-5" />
							Dashboard
						</a>
						<a href="/track-application/tracker/programs" class="text-foreground flex items-center gap-4 px-2.5">
							<Package class="h-5 w-5" />
							Programs
						</a>
						<a
							href="##"
							class="text-muted-foreground hover:text-foreground flex items-center gap-4 px-2.5"
						>
							<ChartLine class="h-5 w-5" />
							Settings
						</a>
					</nav>
				</Sheet.Content>
			</Sheet.Root>
			<Breadcrumb.Root class="hidden md:flex">
				<Breadcrumb.List>
					<Breadcrumb.Item>
						<Breadcrumb.Link href="##">Dashboard</Breadcrumb.Link>
					</Breadcrumb.Item>
					<Breadcrumb.Separator />
				</Breadcrumb.List>
			</Breadcrumb.Root>
			<div class="relative ml-auto flex-1 md:grow-0">
				<Search class="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
				<Input
					type="search"
					placeholder="Search..."
					class="bg-background w-full rounded-lg pl-8 md:w-[200px] lg:w-[336px]"
				/>
			</div>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button builders={[builder]} variant="ghost" class="relative h-8 w-8 rounded-full">
						<Avatar.Root class="h-9 w-9">
							<Avatar.Fallback>{getUserInitials($loggedInUser?.fullName || "John Doe")}</Avatar.Fallback>
						</Avatar.Root>
						<span class="sr-only">Toggle user menu</span>
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					<DropdownMenu.Label>My Account</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<DropdownMenu.Item>Settings</DropdownMenu.Item>
					<DropdownMenu.Item>Support</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item on:click={handleLogout}>Logout</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</header>
		<main class="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
			<div class="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Card.Title class="text-sm font-medium">Applications</Card.Title>
						<CreditCard class="h-4 w-4 text-muted-foreground" />
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">+10</div>
						<p class="text-xs text-muted-foreground">+0.1% from last month</p>
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Card.Title class="text-sm font-medium">Acceptance Rate</Card.Title>
						<Users class="h-4 w-4 text-muted-foreground" />
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">4/10</div>
						<p class="text-xs text-muted-foreground">4%</p>
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Card.Title class="text-sm font-medium">Pending Review</Card.Title>
						<Activity class="h-4 w-4 text-muted-foreground" />
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">+3</div>
						<p class="text-xs text-muted-foreground">+1 since last hour</p>
					</Card.Content>
				</Card.Root>
			</div>
			<ApplicationsTable/>
		</main>
	</div>
</div>
