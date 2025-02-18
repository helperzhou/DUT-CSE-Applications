<script lang="ts">
	import { writable } from 'svelte/store';
	import { onMount } from "svelte";
	import { fly } from 'svelte/transition';
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import { auth, db, storage, collection, getDocs, query, orderBy, addDoc, ref, uploadBytes, getDownloadURL } from "$lib/firebase";
	import * as Card from '$lib/components/ui/card';
	import * as Accordion from '$lib/components/ui/accordion';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';

	// Step Control
	let currentStep = writable(0);

	// Form Data Store
	let formData = writable({
		programName: "",
		programCategory: "",
		businessName: "",
		yearsOfTrading:"",
		registrationNumber: "",
		dateOfRegistration: "",
		businessAddress: "",
		contactPerson: "",
		phoneNumber: "",
		email: "",
		natureOfBusiness: "",
		businessDescription: "",
		annualTurnover: "",
		pastFourMonthsTurnover: "",
		employees: "",
		growthRate: "",
		postalCode: "",
		lastFourMonthsTurnover: "",
		areYouDUTStudent: "no",
		whereDidYouHearAboutUs: "",
		ownerDOB: "",
		gender: "",
		registeredWithSARS: "yes",
		taxCompliance: "compliant",
		bbbbeeCertificate: "yes",
		motivation: "",
		challenges: "",
		interventions: {
			"Marketing and Sales": [],
			"Financial Management & Systems": [],
			"Regulatory Compliance": [],
			"Business Mentorship": [],
			"Technical Training & Webinars": [],
			"Operational Support": [],
			"Growth Plan": [],
			"Project Management": []
		},
		documents: [] // 🔹 Store file URLs here
	});


	const participationOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
	const sections = {
		"Marketing and Sales": [
			"Website Development & Domain Email Registration", "Website Hosting", "Logo",
			"Social Media Page Setup", "Industry Membership", "Company Profile",
			"Email Signature", "Business Cards", "Branded Banner",
			"Pamphlets Brochures", "Marketing Linkages Time", "Marketing Plan",
			"Other Marketing Support", "CRM Solutions Linkages", "Linkages With Chef"
		],
		"Financial Management & Systems": [
			"Management Accounts", "Financial Management Templates",
			"Record Keeping And Management", "Business Funding Proposal",
			"Funding Linkages"
		],
		"Regulatory Compliance": [
			"Insurance Tips Webinar", "Regulatory Compliance (VAT UIF COIDA Registration)",
			"Risk Management Plan", "HRM Support (Key Templates)",
			"Food Compliance Guidance (Webinar)"
		],
		"Business Mentorship": [
			"Financial Literacy Mentoring", "Marketing Mentoring",
			"Executive Mentoring", "Business Ops Plan", "Strategic Plan",
			"Business Communication (How To Pitch)", "Digital Transformation"
		],
		"Technical Training & Webinars": [
			"Excel Skills Training", "Industry Seminars", "Fireside Chat",
			"Industry Training (Courses)", "PUM"
		],
		"Operational Support": [
			"Tools And Equipment Time", "Data Support", "Technology Application Support"
		],
		"Growth Plan": ["Growth Plan"],
		"Project Management": ["Project Facilitation", "Other Support TimeCost"]
	};

	onMount(async () => {
		const user = auth.currentUser;

		// 🔹 Extract program details from URL parameters
		const urlParams = new URLSearchParams(window.location.search);
		const programName = urlParams.get("programName");
		const programCategory = urlParams.get("programCategory");

		// ✅ Update form data with program details from URL
		formData.update(data => ({
			...data,
			programName: programName || "",
			programCategory: programCategory || ""
		}));

		// 🔹 Fetch user data from Firestore if logged in
		if (user) {
			const userId = await getUserIdByEmail(user.email);
			if (userId) {
				await fetchApplicationData(userId);
			}
		}
	});



	const updateInterventions = (category: string, item: string) => {
		formData.update((data) => {
			let updatedCategory = [...data.interventions[category]];

			// Toggle selection
			if (updatedCategory.includes(item)) {
				updatedCategory = updatedCategory.filter(i => i !== item);
			} else {
				updatedCategory.push(item);
			}

			return {
				...data,
				interventions: {
					...data.interventions,
					[category]: updatedCategory
				}
			};
		});
	};



	// Steps for Navigation
	const steps = [
		{ id: 0, name: 'Business Information' },
		{ id: 1, name: 'Business Overview' },
		{ id: 2, name: 'Compliance & Certification' },
		{ id: 3, name: 'Motivation & Challenges' },
		{ id: 4, name: 'Review & Submit' }
	];

	// Navigation Functions
	function nextStep() {
		currentStep.update((step) => Math.min(step + 1, steps.length - 1));
	}

	function prevStep() {
		currentStep.update((step) => Math.max(step - 1, 0));
	}
	// File Input Binding
	let selectedFiles = [];

	// Handle File Selection
	const handleFileSelection = (event) => {
		selectedFiles = event.target.files;
	};

	// Function to Generate Application ID
	const generateApplicationID = async (userId) => {
		const currentYear = new Date().getFullYear();
		const currentDay = new Date().getDate().toString().padStart(2, "0"); // Ensure 2-digit format (e.g., "05")

		// 🔹 Get the user's applications collection
		const applicationsCollection = collection(db, `Users/${userId}/Applications`);
		const q = query(applicationsCollection, orderBy("applicationID", "desc"));

		// 🔹 Fetch existing applications
		const querySnapshot = await getDocs(q);
		let lastNumber = 0;

		if (!querySnapshot.empty) {
			const lastApplication = querySnapshot.docs[0].data();
			const lastAppID = lastApplication.applicationID; // Example: "2024/001234/07"

			// Extract the middle number (NNNNNN) from the last applicationID
			const match = lastAppID.match(/\/(\d{6})\//);
			if (match) {
				lastNumber = parseInt(match[1]); // Extracted 001234 -> 1234
			}
		}

		// 🔹 Generate next application number
		const newApplicationNumber = (lastNumber + 1).toString().padStart(6, "0"); // Ensure 6-digit format (e.g., "001235")

		// 🔹 Construct final Application ID
		return `${currentYear}/${newApplicationNumber}/${currentDay}`;
	};

	const getUserIdByEmail = async (email: string) => {
		try {
			const usersRef = collection(db, "Users"); // Reference Users collection
			const q = query(usersRef);
			const querySnapshot = await getDocs(q);

			let userId = null;

			querySnapshot.forEach((doc) => {
				const userData = doc.data();
				if (userData.userEmail === email) {
					userId = doc.id; // Get Firestore document ID
				}
			});

			return userId;
		} catch (error) {
			console.error("🔥 Error fetching user ID:", error);
			return null;
		}
	};

	const submitToAI = async (applicationData) => {
		try {
			console.log("📡 Sending application data to AI Scoring API...");

			const response = await fetch("https://rairo-ai-screener.hf.space/api/evaluate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(applicationData),
			});

			const result = await response.json();
			console.log("✅ AI Scoring Response:", result);

			return {
				aiRecommendation: result.evaluation["AI Recommendation"],
				aiScore: result.evaluation["AI Score"],
				aiJustification: result.evaluation["Justification"],
			};
		} catch (error) {
			console.error("🔥 Error submitting to AI Screener:", error);
			return null;
		}
	};

	const submitForm = async () => {
		try {
			const user = auth.currentUser;
			if (!user) {
				alert("User not logged in!");
				return;
			}

			const userId = await getUserIdByEmail(user.email);
			if (!userId) {
				alert("User not found in Firestore!");
				return;
			}

			// 🔹 Generate Application ID
			const applicationID = await generateApplicationID(userId);

			// 🔹 Format Data for AI Submission
			const applicationData = {
				company_name: $formData.businessName,
				company_registration_no: $formData.registrationNumber,
				no_of_years_trading: parseInt($formData.yearsOfTrading || "0"),
				sector: $formData.natureOfBusiness,
				current_number_of_employees: parseInt($formData.employees || "0"),
				current_business_turnover: parseInt($formData.annualTurnover || "0"),
				business_description: $formData.businessDescription,
				tax_clearance: $formData.taxCompliance,
				initial_support: $formData.motivation,
			};

			// 🔹 Send Data to AI Scoring API
			const aiResponse = await submitToAI(applicationData);

			if (!aiResponse) {
				alert("Failed to retrieve AI scoring. Please try again.");
				return;
			}

			// 🔹 Reference to Applications Collection
			const applicationsCollection = collection(db, `Users/${userId}/Applications`);
			let uploadedFiles = [];

			// 🔹 Upload Documents to Firebase Storage
			for (let file of selectedFiles) {
				const storageRef = ref(storage, `application_files/${userId}/${file.name}`);
				const snapshot = await uploadBytes(storageRef, file);
				const downloadURL = await getDownloadURL(snapshot.ref);
				uploadedFiles.push(downloadURL);
			}

			// 🔹 Save Data to Firestore (Including AI Scoring)
			await addDoc(applicationsCollection, {
				applicationID,
				...$formData,
				documents: uploadedFiles,
				submittedAt: new Date(),
				aiRecommendation: aiResponse.aiRecommendation,
				aiScore: aiResponse.aiScore,
				aiJustification: aiResponse.aiJustification,
			});

			alert(`✅ Application Submitted Successfully! AI Score: ${aiResponse.aiScore}`);
			goto('/track-application/tracker');

		} catch (error) {
			console.error("🔥 Firestore Error:", error);
			alert("Error submitting application. Please try again.");
		}
	};


	const fetchApplicationData = async (userId) => {
		try {
			const applicationsCollection = collection(db, `Users/${userId}/Applications`);
			const querySnapshot = await getDocs(applicationsCollection);

			if (!querySnapshot.empty) {
				const applicationData = querySnapshot.docs[0].data();
				formData.set({ ...applicationData });
			}
		} catch (error) {
			console.error("🔥 Error fetching application data:", error);
		}
	};
</script>

<!-- Form Wrapper -->
<div class="flex flex-col items-center">
	<Card.Header class="text-center">
		<Card.Title class="text-xl font-semibold">DUT CSE Rapid Incubation Program Application</Card.Title>
	</Card.Header>

	<!-- Step Container -->
	<div class="mx-auto h-[500px] w-[1200px] rounded-lg p-6 shadow-md">
		{#if $currentStep === 0}
			<div transition:fly={{ y: 20, opacity: 0 }} class="w-full">
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-lg font-medium">Step 1: Business Information</Card.Title>
						<Card.Description>Provide essential details about your business.</Card.Description>
					</Card.Header>
					<Card.Content class="grid gap-6">
						<Label for="business-name">Business Name</Label>
						<Input
							id="business-name"
							bind:value={$formData.businessName}
							placeholder="Enter your business name"
						/>
						<Label for="registration-number">Registration Number</Label>
						<Input
							id="registration-number"
							bind:value={$formData.registrationNumber}
							placeholder="Enter registration number"
						/>
						<Label for="business-name">Business Address</Label>
						<Input
							id="business-name"
							bind:value={$formData.businessAddress}
							placeholder="Enter your business address"
						/>
						<Label for="business-name">Postal Code</Label>
						<Input
							id="business-name"
							bind:value={$formData.postalCode}
							placeholder="Enter your business address"
						/>
						<Label for="date-registration">Date of Registration</Label>
						<Input id="date-registration" type="date" bind:value={$formData.dateOfRegistration} />

						<Label for="owner-dob">Number of years of trading</Label>
						<Input id="owner-dob" type="date" bind:value={$formData.yearsOfTraining} />

						<Label for="gender">Gender</Label>
						<Select.Root bind:value={$formData.gender}>
							<Select.Trigger id="gender">
								<Select.Value placeholder="Select Gender" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="male">Male</Select.Item>
								<Select.Item value="female">Female</Select.Item>
								<Select.Item value="other">Other</Select.Item>
							</Select.Content>
						</Select.Root>
						<Label for="owner-dob">Age of Owner (DOB)</Label>
						<Input id="owner-dob" type="date" bind:value={$formData.ownerDOB} />


						<Label for="business-certificate">Upload Business Registration Certificate</Label>
						<Input
							id="business-certificate"
							type="file"
							accept=".pdf,.doc,.docx,.jpg,.png"
							on:change={handleFileSelection}
						/>
					</Card.Content>
					<Card.Footer class="flex justify-end">
						<Button on:click={nextStep}>Next →</Button>
					</Card.Footer>
				</Card.Root>
			</div>
		{/if}

		{#if $currentStep === 1}
			<div transition:fly={{ y: 20, opacity: 0 }} class="w-full">
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-lg font-medium">Step 2: Business Overview</Card.Title>
						<Card.Description>Describe your business operations and activities.</Card.Description>
					</Card.Header>
					<Card.Content class="grid gap-6">
						<Label for="nature-business">Nature of Business</Label>
						<Input
							id="nature-business"
							bind:value={$formData.natureOfBusiness}
							placeholder="Industry/Type of Services"
						/>

						<Label for="business-description">Briefly describe your business</Label>
						<Textarea
							id="business-description"
							bind:value={$formData.businessDescription}
							placeholder="Describe your business"
						/>
						<Label for="dut-student">Are you a DUT Student?</Label>
						<Select.Root bind:value={$formData.areYouDUTStudent}>
							<Select.Trigger id="dut-student">
								<Select.Value placeholder="Select" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="yes">Yes</Select.Item>
								<Select.Item value="no">No</Select.Item>
							</Select.Content>
						</Select.Root>

						<Label for="hear-about-us">Where did you hear about us?</Label>
						<Input id="hear-about-us" bind:value={$formData.whereDidYouHearAboutUs} placeholder="e.g., Social Media, Website, Word of Mouth" />
					</Card.Content>
					<Card.Footer class="flex justify-between">
						<Button variant="ghost" on:click={prevStep}>← Back</Button>
						<Button on:click={nextStep}>Next →</Button>
					</Card.Footer>
				</Card.Root>
			</div>
		{/if}

		{#if $currentStep === 2}
			<div transition:fly={{ y: 20, opacity: 0 }} class="w-full">
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-lg font-medium">Step 3: Compliance & Certification</Card.Title>
					</Card.Header>
					<Card.Content class="grid gap-6">
						<Label for="sars-registration">Registered with SARS?</Label>
						<Select.Root bind:value={$formData.registeredWithSARS}>
							<Select.Trigger id="sars-registration">
								<Select.Value placeholder="Select" />
							</Select.Trigger>
							<Select.Content>
								{#each participationOptions as option}
									<Select.Item value={option.value}>{option.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						<Label for="tax-clearance">Upload Tax Clearance Certificate</Label>
						<Input id="tax-clearance" type="file" accept=".pdf,.doc,.docx,.jpg,.png" on:change={handleFileSelection}  />
					</Card.Content>
					<Card.Footer class="flex justify-between">
						<Button variant="ghost" on:click={prevStep}>← Back</Button>
						<Button on:click={nextStep}>Next →</Button>
					</Card.Footer>
				</Card.Root>
			</div>
		{/if}

		{#if $currentStep === 3}
			<div transition:fly={{ y: 20, opacity: 0 }} class="w-full">
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-lg font-medium">Step 4: Motivation & Challenges</Card.Title>
					</Card.Header>
					<Card.Content class="grid gap-6">
						<Label for="motivation">Why do you want to join?</Label>
						<Textarea
							id="motivation"
							bind:value={$formData.motivation}
							placeholder="Explain your motivation"
						/>
					</Card.Content>
					<Card.Content class="grid gap-6">
						<Label for="intervention-selection">What form of intervention do you need?</Label>
						<Accordion.Root type="multiple">
							{#each Object.keys(sections) as category}
								<Accordion.Item value={category}>
									<!-- Click to expand -->
									<Accordion.Trigger>
										<div class="flex justify-between items-center w-full px-4 py-2 rounded-md cursor-pointer">
											<span class="font-semibold">{category}</span>
										</div>
									</Accordion.Trigger>
									<!-- Show checkboxes when clicked -->
									<Accordion.Content class="px-4 py-2 rounded-md">
										<div class="grid grid-cols-2 gap-4">
											<!-- Left Column -->
											<div>
												{#each sections[category].slice(0, Math.ceil(sections[category].length / 2)) as item}
													<div class="flex items-center gap-2 mb-2">
														<Checkbox
															checked={$formData.interventions[category].includes(item)}
															on:click={() => updateInterventions(category, item)}
														/>
														<Label>{item}</Label>
													</div>
												{/each}
											</div>

											<!-- Right Column -->
											<div>
												{#each sections[category].slice(Math.ceil(sections[category].length / 2)) as item}
													<div class="flex items-center gap-2 mb-2">
														<Checkbox
															checked={$formData.interventions[category].includes(item)}
															on:click={() => updateInterventions(category, item)}
														/>
														<Label>{item}</Label>
													</div>
												{/each}
											</div>
										</div>
									</Accordion.Content>
								</Accordion.Item>
							{/each}
						</Accordion.Root>
					</Card.Content>

					<Card.Footer class="flex justify-between">
						<Button variant="ghost" on:click={prevStep}>← Back</Button>
						<Button on:click={nextStep}>Next →</Button>
					</Card.Footer>
				</Card.Root>
			</div>
		{/if}

		{#if $currentStep === 4}
			<div transition:fly={{ y: 20, opacity: 0 }} class="w-full">
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-lg font-medium">Final Step: Upload Documents</Card.Title>
						<Card.Description
							>Please upload all relevant certificates and documents.</Card.Description
						>
					</Card.Header>
					<Card.Content class="grid gap-6">
						<Label for="bbbbee-certificate">Upload BBBEE Certificate</Label>
						<Input
							id="bbbbee-certificate"
							type="file"
							accept=".pdf,.doc,.docx,.jpg,.png"
							on:change={handleFileSelection}
						/>

						<Label for="additional-docs">Upload Any Other Relevant Documents</Label>
						<Input id="additional-docs" type="file" accept=".pdf,.doc,.docx,.jpg,.png" multiple on:change={handleFileSelection} />
					</Card.Content>
					<Card.Footer class="flex justify-between">
						<Button variant="ghost" on:click={prevStep}>← Back</Button>
						<Button on:click={submitForm} class="rounded bg-green-500 px-4 py-2 text-white">
							Submit ✅
						</Button>
					</Card.Footer>
				</Card.Root>
			</div>
		{/if}
	</div>
</div>
