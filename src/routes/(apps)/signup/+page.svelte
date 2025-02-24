<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { Button } from "$lib/components/ui/button";
	import { Label } from "$lib/components/ui/label";
	import { Input } from "$lib/components/ui/input";
	import { db, auth, collection, addDoc, createUserWithEmailAndPassword } from "$lib/firebase";
	import { writable } from "svelte/store";
	import  { Icons } from "$lib/components/ui/icons";
	import { slide } from "svelte/transition"; // ✅ Import slide transition

	const isSliding = writable(false);

	// ✅ Add transition before navigating to signup
	const goToSignin = () => {
		isSliding.set(true); // Start slide effect
		setTimeout(() => {
			goto("/signin"); // Navigate after animation
		}, 500); // Delay for smooth transition
	};
	const isLoading = writable(false); // ✅ Loading state
	let errorMessage = writable(""); // ✅ Error message state

	// Form Data
	let firstName = "";
	let lastName = "";
	let email = "";
	let password = "";

	// 🔹 Firestore & Authentication Error Messages
	const firestoreErrorMessages: Record<string, string> = {
		"auth/claims-too-large": "Your account settings are too large to process. Try reducing custom data.",
		"auth/email-already-exists": "This email is already registered. Try logging in instead.",
		"auth/id-token-expired": "Your session has expired. Please log in again.",
		"auth/id-token-revoked": "Your session has been revoked. Log in again to continue.",
		"auth/insufficient-permission": "You don’t have permission to perform this action. Contact support if needed.",
		"auth/internal-error": "An unexpected error occurred. Please try again later.",
		"auth/invalid-argument": "There was an issue with the data you entered. Please check and try again.",
		"auth/invalid-claims": "The account settings provided are invalid. Contact support.",
		"auth/invalid-continue-uri": "The redirect link is invalid. Please use a valid URL.",
		"auth/invalid-creation-time": "The provided creation date is not formatted correctly.",
		"auth/invalid-credential": "There is a problem with your login credentials. Try again or reset your password.",
		"auth/invalid-disabled-field": "Invalid account status. Please contact support.",
		"auth/invalid-display-name": "The name must be a valid, non-empty text.",
		"auth/invalid-dynamic-link-domain": "The provided link is not configured for this project.",
		"auth/invalid-email": "Please enter a valid email address.",
		"auth/invalid-email-verified": "The email verification status must be true or false.",
		"auth/invalid-hash-algorithm": "Invalid password encryption method.",
		"auth/invalid-hash-block-size": "Invalid password hash settings.",
		"auth/invalid-hash-derived-key-length": "Invalid password encryption settings.",
		"auth/invalid-hash-key": "Invalid security key for password storage.",
		"auth/invalid-hash-memory-cost": "Invalid security settings for password encryption.",
		"auth/invalid-hash-parallelization": "Invalid security settings for password encryption.",
		"auth/invalid-hash-rounds": "Invalid password encryption strength.",
		"auth/invalid-hash-salt-separator": "Invalid password hashing method.",
		"auth/invalid-id-token": "Your login session is invalid. Please log in again.",
		"auth/invalid-last-sign-in-time": "Invalid last login timestamp.",
		"auth/invalid-page-token": "Invalid page request. Please try again.",
		"auth/invalid-password": "Your password must be at least 6 characters long.",
		"auth/invalid-password-hash": "Invalid password format.",
		"auth/invalid-password-salt": "Invalid password security settings.",
		"auth/invalid-phone-number": "Invalid phone number format. Use E.164 format (e.g., +1234567890).",
		"auth/invalid-photo-url": "Invalid profile picture link. Use a proper URL.",
		"auth/invalid-provider-data": "Invalid authentication provider data.",
		"auth/invalid-provider-id": "Invalid login provider selected.",
		"auth/invalid-oauth-responsetype": "Invalid OAuth login settings.",
		"auth/invalid-session-cookie-duration": "Session must last between 5 minutes and 2 weeks.",
		"auth/invalid-uid": "User ID must be a non-empty string with up to 128 characters.",
		"auth/invalid-user-import": "Invalid user data provided.",
		"auth/maximum-user-count-exceeded": "Too many users created at once. Try again later.",
		"auth/missing-android-pkg-name": "Android package name is missing.",
		"auth/missing-continue-uri": "A redirect URL must be provided.",
		"auth/missing-hash-algorithm": "Missing security encryption details for password import.",
		"auth/missing-ios-bundle-id": "Missing iOS bundle ID.",
		"auth/missing-uid": "User ID is required.",
		"auth/missing-oauth-client-secret": "OAuth client secret is required.",
		"auth/operation-not-allowed": "This login method is disabled. Contact support.",
		"auth/phone-number-already-exists": "This phone number is already linked to another account.",
		"auth/project-not-found": "Firebase project not found. Contact support.",
		"auth/reserved-claims": "Some settings are restricted and cannot be used.",
		"auth/session-cookie-expired": "Session expired. Log in again.",
		"auth/session-cookie-revoked": "Session has been revoked. Please log in again.",
		"auth/too-many-requests": "Too many failed attempts. Please wait before trying again.",
		"auth/uid-already-exists": "This user ID is already taken.",
		"auth/unauthorized-continue-uri": "This redirect link is not allowed. Contact support.",
		"auth/user-not-found": "No account found with this email. Please check or sign up.",
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
<div class="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 " transition:slide="{{ x: isSliding ? -500 : 0 }}" >
	<!-- 🔹 LEFT SIDE: Background Image & Text -->
	<div class="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
		<div class="absolute inset-0 bg-cover" style="background-image: url(https://images.unsplash.com/photo-1590069261209-f8e9b8642343?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1376&q=80);"></div>
		<div class="relative flex items-center text-lg font-medium">
			<!-- ✅ Icon Positioned Absolutely Behind Text -->
			<div class="absolute left-4 top-1/2 -translate-y-1/2 opacity-1">
				<img src="/dut-cseri.png" alt="CSE Icon" class="h-16 w-26 object-cover">
			</div>
			<!-- ✅ Text with Higher z-index -->
			<span class="relative z-10 ml-60">DUT | CSE Rapid Incubation Program</span>
		</div>

		<div class="absolute right-2 bottom-2 -translate-y-1/2 z-20">
			<img src="/quantIcon.png" alt="User Avatar" class="h-20 w-26 rounded-sm object-contain opacity-1">
		</div>
	</div>

	<!-- 🔹 RIGHT SIDE: SIGN-UP FORM -->
	<div class="lg:p-8">
		<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
			<div class="flex flex-col space-y-2 text-center">
				<h1 class="text-2xl font-semibold tracking-tight">Sign Up</h1>
				<p class="text-muted-foreground text-sm">Enter your information to create an account and be able to apply.</p>
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
				<a href="##" class="underline" on:click={goToSignin}>Sign In</a>
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
