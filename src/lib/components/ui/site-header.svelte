<script lang="ts">
	import {
		CommandMenu,
		MainNav,
		MobileNav,
	} from "$lib/components/ui/index.js";
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import ModeSwitch from '$lib/components/ui/mode-switch/mode-switch.svelte';
	import Search from 'lucide-svelte/icons/search-code';
	import { Button } from '$lib/components/ui/button'
	import { Input } from '$lib/components/ui/input';
	import CircleUser from 'lucide-svelte/icons/circle-user';
	import { auth } from "$lib/firebase"; // Import Firebase Auth
	import { signOut } from "firebase/auth";
	import {goto} from "$app/navigation"
	// Handle Logout
	const handleLogout = async () => {
		try {
			await signOut(auth);
			goto("/track-application/signin"); // Redirect after logout
		} catch (error) {
			console.error("Logout error:", error);
		}
	};
</script>

<header
	class="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur"
>
	<div class="container flex h-14 max-w-screen-2xl items-center">
		<MainNav />
		<MobileNav />
		<div class="flex flex-1 items-center justify-between space-x-2 md:justify-end">
			<div class="w-full flex-1 md:w-auto md:flex-none">
				<CommandMenu />
			</div>
			<div class="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
				<form class="ml-auto flex-1 sm:flex-initial">
					<div class="relative">
						<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Search programs..."
							class="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
						/>
					</div>
				</form>
				<DropdownMenu.Root>
					<ModeSwitch />
					<DropdownMenu.Trigger asChild let:builder>
						<Button builders={[builder]} variant="secondary" size="icon" class="rounded-full">
							<CircleUser class="h-5 w-5" />
							<span class="sr-only">Toggle user menu</span>
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						<DropdownMenu.Label>My Account</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.Item>Settings</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item on:click={handleLogout}>Logout</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		</div>
	</div>
</header>
