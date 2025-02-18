<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { auth, db, signInWithEmailAndPassword } from "$lib/firebase";
	import { query, where, getDocs, collection } from "firebase/firestore";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";

	// Form state
	let email = "";
	let password = "";
	let errorMessage = "";

	// Handle Login
	const handleLogin = async () => {
		try {
			// 🔹 Sign in user with Firebase Authentication
			const userCredential = await signInWithEmailAndPassword(auth, email, password);

			// 🔹 Query Firestore for the user document using email
			const usersCollection = collection(db, "Users"); // Ensure correct collection name
			const userQuery = query(usersCollection, where("userEmail", "==", email));
			const querySnapshot = await getDocs(userQuery);

			if (!querySnapshot.empty) {
				const userDoc = querySnapshot.docs[0]; // Get the first matching document
				const userData = userDoc.data();
				const userRole = userData.userRole || "user"; // Default to "user" if missing

				// 🔹 Redirect based on role
				if (userRole === "admin") {
					goto("/dashboard");
				} else {
					goto("/track-application/tracker");
				}
			} else {
				errorMessage = "User data not found. Contact support.";
			}
		} catch (error) {
			console.error("🔥 Firebase Auth Error:", error);
			errorMessage = error.message;
		}
	};
</script>

<div class="h-screen w-full lg:grid lg:min-h-[600px] lg:grid-cols-2">
	<div class="flex items-center justify-center py-12">
		<div class="mx-auto grid w-[350px] gap-6">
			<div class="grid gap-2 text-center">
				<h1 class="text-3xl font-bold">Login</h1>
				<p class="text-muted-foreground text-balance">
					Enter your email below to login to your account
				</p>
			</div>
			<!-- Display Error Message -->
			{#if errorMessage}
				<p class="text-red-500 text-sm text-center">{errorMessage}</p>
			{/if}
			<div class="grid gap-4">
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input id="email" type="email" placeholder="m@example.com" bind:value={email} required />
				</div>
				<div class="grid gap-2">
					<Label for="password">Password</Label>
					<Input id="password" type="password" bind:value={password} required />
					<a href="##" class="mr-auto inline-block text-sm underline">Forgot your password?</a>
				</div>
				<Button type="button" class="w-full" on:click={handleLogin}>Login</Button>
				<Button variant="outline" class="w-full">Login with Google</Button>
			</div>
			<div class="mt-4 text-center text-sm">
				Don&apos;t have an account?
				<a href="/track-application/signup" class="underline"> Sign up </a>
			</div>
		</div>
	</div>

	<!-- Background Section -->
	<div class="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
		<div
			class="absolute inset-0 bg-cover"
			style="
				background-image:
					url(https://images.unsplash.com/photo-1590069261209-f8e9b8642343?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1376&q=80);"
		></div>
		<div class="relative flex items-center text-lg font-medium">
			<div class="absolute left-0 top-1/2 -translate-y-1/2 opacity-1">
				<img src="/dut.png" alt="DUT Icon" class="h-16 w-16 rounded-full object-cover">
			</div>
			<!-- ✅ Icon Positioned Absolutely Behind Text -->
			<div class="absolute left-14 top-1/2 -translate-y-1/2 opacity-1">
				<img src="/dut-cse.png" alt="CSE Icon" class="h-16 w-16 rounded-full object-cover">
			</div>
			<!-- ✅ Text with Higher z-index -->
			<span class="relative z-10 ml-40">DUT | CSE Rapid Incubation Program</span>
		</div>

		<div class="absolute right-2 bottom-2 -translate-y-1/2 z-20">
			<img src="/quantIcon.png" alt="User Avatar" class="h-16 w-16 rounded-full opacity-1">
		</div>

	</div>
</div>
