<script lang="ts">
	import { onMount } from "svelte";
	import { Button } from "$lib/components/ui/button";
	import { Label } from "$lib/components/ui/label";
	import { Input } from "$lib/components/ui/input";
	import { db, auth, collection, addDoc, createUserWithEmailAndPassword } from "$lib/firebase";
	import { writable } from "svelte/store";
	import  { Icons } from "$lib/components/ui/icons/index";

	const isLoading = writable(false); // ✅ Loading state
	let errorMessage = writable(""); // ✅ Error message state

	// Form Data
	let firstName = "";
	let lastName = "";
	let email = "";
	let password = "";

	// 🔹 Firestore & Authentication Error Messages
	const firestoreErrorMessages: Record<string, string> = {
		"auth/invalid-email": "Invalid email address. Please check and try again.",
		"auth/user-disabled": "This account has been disabled. Contact support.",
		"auth/user-not-found": "No user found with this email. Please sign up first.",
		"auth/wrong-password": "Incorrect password. Try again or reset your password.",
		"auth/email-already-in-use": "Email is already in use. Try logging in instead.",
		"auth/weak-password": "Password is too weak. Try a stronger one.",
		"auth/network-request-failed": "Network error. Check your internet connection.",
		"auth/too-many-requests": "Too many failed login attempts. Try again later.",
		"auth/internal-error": "Unexpected error. Please try again.",
		"permission-denied": "You don't have permission to access this data.",
		"not-found": "Requested data was not found in the database.",
		"deadline-exceeded": "The operation took too long to complete. Try again.",
		"unavailable": "Firestore service is currently unavailable. Try later.",
		"already-exists": "Record already exists in the database.",
		"failed-precondition": "Database rules prevent this action at the moment.",
	};

	// 🔹 Handle User Signup
	const handleSignup = async () => {
		isLoading.set(true);
		errorMessage.set(""); // Reset error message

		try {
			// ✅ Create User in Firebase Authentication
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			const user = userCredential.user;

			// ✅ Save User Details in Firestore
			const usersCollection = collection(db, "Users");
			await addDoc(usersCollection, {
				userEmail: email,
				userFullName: `${firstName} ${lastName}`,
				userRole: "user", // Default user role
				createdAt: new Date(),
			});

			console.log("✅ User registered successfully:", user.email);

		} catch (error) {
			console.error("🔥 Firebase Auth Error:", error);
			// 🔹 Set user-friendly error message
			errorMessage.set(firestoreErrorMessages[error.code] || "An unknown error occurred. Please try again.");
		} finally {
			isLoading.set(false);
		}
	};
</script>
<div class="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
	<!-- 🔹 LEFT SIDE: Background Image & Text -->
	<div class="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
		<div class="absolute inset-0 bg-cover" style="background-image: url(https://images.unsplash.com/photo-1590069261209-f8e9b8642343?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1376&q=80);"></div>
	</div>

	<!-- 🔹 RIGHT SIDE: SIGN-UP FORM -->
	<div class="lg:p-8">
		<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
			<div class="flex flex-col space-y-2 text-center">
				<h1 class="text-2xl font-semibold tracking-tight">Sign Up</h1>
				<p class="text-muted-foreground text-sm">Enter your information to create an account</p>
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

				<!-- 🔹 Display Error Message -->
				{#if $errorMessage}
					<p class="text-red-500 text-sm text-center">⚠️ {$errorMessage}</p>
				{/if}

				<Button type="button" class="w-full" on:click={handleSignup} disabled={$isLoading}>
					{#if $isLoading}
						<Icons.spinner class="mr-2 h-4 w-4 animate-spin" />
						Signing Up...
					{:else}
						Create an account
					{/if}
				</Button>
			</form>

			<!-- Login Link -->
			<div class="mt-4 text-center text-sm">
				Already have an account?
				<a href="/signin" class="underline"> Sign in </a>
			</div>

			<!-- Terms & Privacy Notice -->
			<p class="text-muted-foreground px-8 text-center text-sm">
				By clicking continue, you agree to our
				<a href="##" class="hover:text-primary underline underline-offset-4">Terms of Service</a>
				and
				<a href="##" class="hover:text-primary underline underline-offset-4">Privacy Policy</a>.
			</p>
		</div>
	</div>
</div>
