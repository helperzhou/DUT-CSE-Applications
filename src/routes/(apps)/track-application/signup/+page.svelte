<script lang="ts">
	import { onMount } from "svelte";
	import { Button } from "$lib/components/ui/button";
	import { Label } from "$lib/components/ui/label";
	import { Input } from "$lib/components/ui/input";
	// import { toast } from "svelte-sonner";
	import { db, auth, collection, addDoc, createUserWithEmailAndPassword } from "$lib/firebase";

	// Form Data
	let firstName = "";
	let lastName = "";
	let email = "";
	let password = "";

	// Handle User Signup
	const handleSignup = async () => {
		try {
			// 🔹 Create User in Firebase Authentication
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			const user = userCredential.user;

			// 🔹 Save User Details in Firestore
			const usersCollection = collection(db, "Users");

			await addDoc(usersCollection, {
				userEmail: email,
				userFullName: `${firstName} ${lastName}`,
				userPassword: password, // ⚠️ Do NOT store plaintext passwords in production
				userRole: "user", // Default user role
				createdAt: new Date()
			});

			// toast.success("Event has been created", {
			// 	description: "Sunday, December 03, 2023 at 9:00 AM",
			// 	action: {
			// 		label: "Undo",
			// 		onClick: () => console.info("Undo")
			// 	}
			// });
		} catch (error) {
			console.error("🔥 Firebase Auth Error:", error);
			alert(`Error: ${error.message}`);
		}
	};

</script>

<div class="md:hidden">
	<!--	<enhanced:img src={AuthenticationLight} alt="Authentication" class="block dark:hidden" />-->
	<!--	<enhanced:img src={AuthenticationDark} alt="Authentication" class="hidden dark:block" />-->
</div>

<div class="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
	<!-- 🔹 Login Button (Top Right) -->
	<Button href="/track-application/signin" variant="ghost" class="absolute right-4 top-4 md:right-8 md:top-8">
		Login
	</Button>

	<!-- 🔹 LEFT SIDE: Background Image & Text -->
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

	<!-- 🔹 RIGHT SIDE: SIGN-UP FORM -->
	<div class="lg:p-8">
		<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
			<div class="flex flex-col space-y-2 text-center">
				<h1 class="text-2xl font-semibold tracking-tight">Sign Up</h1>
				<p class="text-muted-foreground text-sm">
					Enter your information to create an account
				</p>
			</div>

			<!-- SIGN-UP FORM -->
			<form on:submit|preventDefault={handleSignup} class="grid gap-4">
				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="first-name">First name</Label>
						<Input id="first-name" bind:value={firstName} placeholder="Max" required />
					</div>
					<div class="grid gap-2">
						<Label for="last-name">Last name</Label>
						<Input id="last-name" bind:value={lastName} placeholder="Robinson" required />
					</div>
				</div>
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input id="email" type="email" bind:value={email} placeholder="m@example.com" required />
				</div>
				<div class="grid gap-2">
					<Label for="password">Password</Label>
					<Input id="password" type="password" bind:value={password} required />
				</div>
				<Button type="submit" class="w-full">Create an account</Button>
			</form>

			<!-- Login Link -->
			<div class="mt-4 text-center text-sm">
				Already have an account?
				<a href="/signin" class="underline"> Sign in </a>
			</div>

			<!-- Terms & Privacy Notice -->
			<p class="text-muted-foreground px-8 text-center text-sm">
				By clicking continue, you agree to our
				<a href="/terms" class="hover:text-primary underline underline-offset-4">
					Terms of Service
				</a>
				and
				<a href="/privacy" class="hover:text-primary underline underline-offset-4">
					Privacy Policy
				</a>.
			</p>
		</div>
	</div>
</div>
