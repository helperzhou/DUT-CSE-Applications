<script lang="ts">
	import { get, writable } from 'svelte/store';
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
		programID: "",
		programName: "",
		programCategory: "",
		fullName: "",
		applicantGender:"",
		applicantAge:"",
		applicantIDNumber:"",
		applicantDisability:"",
		applicantAcademicQualification: "",
		areYouDUTStudent: "no",
		phoneNumber: "",
		businessName: "",
		yearsOfTrading:"",
		registrationNumber: "",
		dateOfRegistration: "",
		businessAddress: "",
		businessEmail: "",
		socialMediaWebsiteAddress:"",
		socialMediaInstagramAddress:"",
		socialMediaXAddress:"",
		socialMediaFacebookAddress:"",
		socialMediaLinkedInAddress:"",
		socialMediaOtherAddress:"",
		natureOfBusiness: "",
		businessDescription: "",
		annualTurnover: "",
		pastFourMonthsTurnover: "",
		businessNumberOfEmployees: "",
		businessGrowthRate: "",
		postalCode: "",
		lastFourMonthsTurnover: "",
		revenueFor2023:"",
		revenueFor2024:"",
		whereDidYouHearAboutUs: "",
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


	const minWordCount = {
		businessDescription: 200,
		motivation: 200,
		challenges: 200,
	};

	const softwareAreas = ["Financial Management", "Human Resources", "Marketing", "Risk Management", "Other"]
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
		const programID = urlParams.get("programID");
		const programName = urlParams.get("programName");
		const programCategory = urlParams.get("programCategory");

		// ✅ Update form data with program details from URL
		formData.update(data => ({
			...data,
			programID: programID || "",
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
		{ id: 0, name: 'Personal Details' },
		{ id: 1, name: 'Business Information' },
		{ id: 2, name: 'Financial & Resource Information' },
		{ id: 3, name: 'Motivation & Challenges' },
		{ id: 4, name: 'Compliance & Certification' }
	];


	$: selectedGender = $formData.applicantGender
		? {
			label: $formData.applicantGender,
			value: $formData.applicantGender
		}
		: undefined;
	$: selectedDisability = $formData.applicantDisability
		? {
			label: $formData.applicantDisability,
			value: $formData.applicantDisability
		}
		: undefined;
	$: selectedAcademicQualification = $formData.applicantAcademicQualification
		? {
			label: $formData.applicantAcademicQualification,
			value: $formData.applicantAcademicQualification
		}
		: undefined;

	$: selectedAreYouDUTStudent = $formData.areYouDUTStudent
		? {
			label: $formData.areYouDUTStudent,
			value: $formData.areYouDUTStudent
		}
		: undefined;

	$: selectedRegisteredWithSARS = $formData.registeredWithSARS
		? {
			label: $formData.registeredWithSARS,
			value: $formData.registeredWithSARS
		}
		: undefined;

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
			console.log("✅ Raw AI Response:", result);

			// 🔹 Check if `raw_response` exists and contains valid JSON
			let aiEvaluation = null;
			if (result.evaluation && result.evaluation.raw_response) {
				try {
					// Remove triple backticks (```) and parse the inner JSON
					const cleanedJsonString = result.evaluation.raw_response
						.replace(/^```json/, '')  // Remove starting ```
						.replace(/```$/, '')       // Remove ending ```
						.trim();                    // Trim whitespace

					aiEvaluation = JSON.parse(cleanedJsonString);
					console.log("✅ Parsed AI Evaluation:", aiEvaluation);
				} catch (parseError) {
					console.error("🔥 Error parsing AI evaluation JSON:", parseError);
				}
			}

			return {
				aiRecommendation: aiEvaluation?.["AI Recommendation"] || "Unknown",
				aiScore: aiEvaluation?.["AI Score"] || 0,
				aiJustification: aiEvaluation?.["Justification"] || "No justification provided",
			};
		} catch (error) {
			console.error("🔥 Error submitting to AI Screener:", error);
			return null;
		}
	};

	// Modal Visibility
	let showModal = writable(false);
	let modalMessage = writable("Processing your application...");

	// Array of messages to show while submitting
	const loadingMessages = [
		"Scanning Documents...",
		"Verifying Authenticity...",
		"Checking Compliance...",
		"Uploading Your Application...",
		"Finalizing Submission..."
	];
	const requiredFields = {
		0: ["fullName", "applicantGender", "applicantIDNumber", "applicantAge", "applicantAcademicQualification", "areYouDUTStudent"],
		1: ["businessName", "natureOfBusiness", "businessDescription", "yearsOfTrading", "registrationNumber", "dateOfRegistration", "businessAddress", "postalCode"],
		2: ["revenueFor2023", "revenueFor2024", "pastFourMonthsTurnover", "businessNumberOfEmployees", "businessGrowthRate", "registeredWithSARS"],
		3: ["motivation"],
		4: ["documents"] // Ensure at least one document is uploaded
	};

	// Navigation Functions
	function countWords(text: string) {
		return text.trim().split(/\s+/).filter(word => word.length > 0).length;
	}

	function validateStep() {
		const stepFields = requiredFields[get(currentStep)];
		if (!stepFields) return true; // No required fields for this step

		const formValues = get(formData);
		let isValid = true;
		let missingFields = [];
		let wordCountErrors = [];

		stepFields.forEach((field) => {
			const value = formValues[field];

			if (
				value === undefined || // Undefined value
				value === null || // Null value
				(typeof value === "string" && value.trim() === "") || // Empty string
				(typeof value === "number" && isNaN(value)) || // NaN check
				(Array.isArray(value) && value.length === 0) // Empty array (for checkboxes)
			) {
				isValid = false;
				missingFields.push(field);
			}

			// ✅ Check word count if the field is in minWordCount
			if (minWordCount[field] && typeof value === "string") {
				const wordCount = countWords(value);
				if (wordCount < minWordCount[field]) {
					isValid = false;
					wordCountErrors.push(`${field} must be at least ${minWordCount[field]} words (currently ${wordCount} words)`);
				}
			}
		});

		if (!isValid) {
			let errorMessage = "";
			if (missingFields.length > 0) {
				errorMessage += `❌ Please fill in the required fields: ${missingFields.join(", ")}.\n`;
			}
			if (wordCountErrors.length > 0) {
				errorMessage += `⚠️ Word count issues:\n${wordCountErrors.join("\n")}`;
			}
			alert(errorMessage);
		}

		return isValid;
	}

	function nextStep() {
		if (!validateStep()) return; // Prevent moving to next step if validation fails

		currentStep.update((step) => Math.min(step + 1, steps.length - 1));
	}
	function prevStep() {
		currentStep.update((step) => Math.max(step - 1, 0));
	}
	// Function to cycle through messages
	let messageIndex = 0;
	const updateModalMessage = () => {
		modalMessage.set(loadingMessages[messageIndex % loadingMessages.length]);
		messageIndex++;
		setTimeout(updateModalMessage, 2000); // Change message every 2 seconds
	};

	const submitForm = async () => {
		try {
			showModal.set(true); // Show modal
			updateModalMessage(); // Start cycling through messages

			const user = auth.currentUser;
			if (!user) {
				alert("User not logged in!");
				showModal.set(false); // Hide modal on error
				return;
			}

			if (get(currentStep) === 4 && get(formData).documents.length === 0) {
				alert("❌ Please upload at least one document before submitting.");
				return;
			}

			const userId = await getUserIdByEmail(user.email);
			if (!userId) {
				alert("User not found in Firestore!");
				showModal.set(false);
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
				// alert("Failed to retrieve AI scoring. Please try again.");
				showModal.set(false);
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

			// alert(`✅ Application Submitted Successfully! AI Score: ${aiResponse.aiScore}`);
			showModal.set(false); // Hide modal after submission
			goto('/track-application/tracker');

		} catch (error) {
			console.error("🔥 Firestore Error:", error);
			alert("Error submitting application. Please try again.");
			showModal.set(false);
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
<!-- ✅ MODAL FOR LOADING SCREEN -->
{#if $showModal}
	<div class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
		<div class="bg-accent p-6 rounded-lg shadow-lg text-center">
			<div class="flex justify-center items-center">
				<svg class="animate-spin h-8 w-8 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
				</svg>
				<p class="text-lg font-medium">{$modalMessage}</p>
			</div>
		</div>
	</div>
{/if}

<!-- Form Wrapper -->
<div class="flex flex-col items-center">
	<Card.Header class="text-center">
		<Card.Title class="text-xl font-semibold">DUT CSE Rapid Incubation Program Application</Card.Title>
	</Card.Header>

	<!-- Step Container -->
	<div class="mx-auto h-[500px] w-[1200px] rounded-lg p-6 shadow-md mb-2">
		{#if $currentStep === 0}
			<div transition:fly={{ y: 20, opacity: 0 }} class="w-full">
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-lg font-medium">Step 1: Personal Details</Card.Title>
						<Card.Description>Provide some details about yourself.</Card.Description>
					</Card.Header>
					<Card.Content class="grid gap-6">
						<Label for="full-name">Full Name</Label>
						<Input
							id="full-name"
							bind:value={$formData.fullName}
							placeholder="Enter your full name"
						/>
						<Label for="applicant-id-number">ID Number</Label>
						<Input
							id="applicant-id-number"
							bind:value={$formData.applicantIDNumber}
							placeholder="Enter your ID number"
						/>
						<Label for="gender">Select Gender</Label>
						<Select.Root
							selected={selectedGender}
							onSelectedChange={(v) => {
								if (v) {
									$formData.applicantGender = v.value;
								}
							}}
						>
							<Select.Trigger id="gender">
								<Select.Value placeholder="Select Gender" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="male">Male</Select.Item>
								<Select.Item value="female">Female</Select.Item>
							</Select.Content>
						</Select.Root>
						<input hidden bind:value={$formData.applicantGender} name="applicantGender" />


						<Label for="owner-age">Age</Label>
						<Input id="owner-age" type="number" bind:value={$formData.applicantAge} placeholder="Enter Your Age"/>

						<Label for="gender">Do You Have Any Disability</Label>
						<Select.Root
							selected={selectedDisability}
							onSelectedChange={(v) => {
								if (v) {
									$formData.applicantDisability = v.value;
								}
							}}
						>
							<Select.Trigger id="disability">
								<Select.Value placeholder="Select Response" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="yes">Yes</Select.Item>
								<Select.Item value="no">No</Select.Item>
							</Select.Content>
						</Select.Root>
						<input hidden bind:value={$formData.applicantDisability} name="applicantDisability" />

						<Label for="academic-qualification">Academic Qualification</Label>

						<Select.Root
							selected={selectedAcademicQualification}
							onSelectedChange={(v) => {
    if (v) {
      $formData.applicantAcademicQualification = v.value;
    }
  }}
						>
							<Select.Trigger id="academic-qualification">
								<Select.Value placeholder="Select Response" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="below-metric">Below Metric</Select.Item>
								<Select.Item value="metric">Metric</Select.Item>
								<Select.Item value="under-graduate">
									Under Graduate (Certificate, Diploma, Bachelors etc)
								</Select.Item>
								<Select.Item value="post-graduate">
									Post Graduate (Honors, Post Graduate Diploma etc)
								</Select.Item>
								<Select.Item value="master">Masters</Select.Item>
								<Select.Item value="phd">PhD</Select.Item>
							</Select.Content>
						</Select.Root>

						<input hidden bind:value={$formData.applicantAcademicQualification} name="applicantAcademicQualification" />


						<Label for="dut-student">Are You A DUT Student</Label>

						<Select.Root
							selected={selectedAreYouDUTStudent}
							onSelectedChange={(v) => {
    if (v) {
      $formData.areYouDUTStudent = v.value;
    }
  }}
						>
							<Select.Trigger id="dut-student">
								<Select.Value placeholder="Select Response" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="yes">Yes</Select.Item>
								<Select.Item value="no">No</Select.Item>
							</Select.Content>
						</Select.Root>

						<input hidden bind:value={$formData.areYouDUTStudent} name="areYouDUTStudent" />

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
						<Label for="business-name">Business Name</Label>
						<Input
							id="business-name"
							bind:value={$formData.businessName}
							placeholder="Enter your business name"
						/>
						<Label for="nature-business">Nature of Business</Label>
						<Input
							id="nature-business"
							bind:value={$formData.natureOfBusiness}
							placeholder="Industry/Type of Services"
						/>
						<Label for="business-description">Briefly describe your business (Min: 200 words)</Label>
						<Textarea
							id="business-description"
							bind:value={$formData.businessDescription}
							placeholder="Describe your business"
							on:input={() => minWordCount.businessDescription = countWords($formData.businessDescription)}
						/>
						<p class="word-count">Word count: {minWordCount.businessDescription} / 200</p>
						<Label for="years-of-trading">Number of years of trading</Label>
						<Input id="years-of-trading" type="number" bind:value={$formData.yearsOfTrading} />

						<Label for="registration-number">Registration Number</Label>
						<Input
							id="registration-number"
							bind:value={$formData.registrationNumber}
							placeholder="Enter registration number"
						/>
						<Label for="date-registration">Date of Registration</Label>
						<Input id="date-registration" type="date" bind:value={$formData.dateOfRegistration} />



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

						<Card.Root class="mx-auto w-[950px]">
							<Card.Header>
								<Card.Title class="text-lg font-small text-center">Website And Business Social Media Links</Card.Title>
							</Card.Header>
							<Card.Content>
								<div class="flex flex-row justify-between my-4">
									<Label for="website-address">Website Address</Label>
									<Input
										id="website-address"
										bind:value={$formData.socialMediaWebsiteAddress}
										placeholder="Enter your business website address"
										class="w-[350px]"
									/>
								</div>
								<div class="flex flex-row justify-between my-4">
									<Label for="social-media-x-address">X (Formerly Twitter) Address</Label>
									<Input
										id="social-media-x-address"
										bind:value={$formData.socialMediaXAddress}
										placeholder="Enter your business X (Formerly Twitter) address"
											class="w-[350px]"
									/>
								</div>
								<div class="flex flex-row justify-between my-4">
									<Label for="social-media-instagram-address">Instagram Address</Label>
									<Input
										id="social-media-instagram-address"
										bind:value={$formData.socialMediaInstagramAddress}
										placeholder="Enter your business Instagram address"
											class="w-[350px]"
									/>
								</div>
								<div class="flex flex-row justify-between my-4">
									<Label for="social-media-facebook-address">Facebook Address</Label>
									<Input
										id="social-media-facebook-address"
										bind:value={$formData.socialMediaFacebookAddress}
										placeholder="Enter your business Facebook address"
											class="w-[350px]"
									/>
								</div>
								<div class="flex flex-row justify-between my-4">
									<Label for="social-media-linkedin-address">LinkedIn</Label>
									<Input
										id="social-media-linkedin-address"
										bind:value={$formData.socialMediaLinkedInAddress}
										placeholder="Enter your business LinkedIn address"
											class="w-[350px]"
									/>
								</div>
								<div class="flex flex-row justify-between my-4">
									<Label for="social-media-other">Other</Label>
									<Input
										id="social-media-other"
										bind:value={$formData.socialMediaOtherAddress}
										placeholder="Enter any other platform link"
											class="w-[350px]"
									/>
								</div>
							</Card.Content>
						</Card.Root>

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
						<Card.Title class="text-lg font-medium">Step 3: Finance & Performance</Card.Title>
					</Card.Header>
					<Card.Content class="grid gap-6">
						<Label for="revenue-for-2023">Turnover For 2023</Label>
						<Input
							id="revenue-for-2023"
							bind:value={$formData.revenueFor2023}
							placeholder="Enter your turnover for the year 2023"
						/>
						<Label for="revenue-for-2024">Turnover For 2024</Label>
						<Input
							id="revenue-for-2024"
							bind:value={$formData.revenueFor2024}
							placeholder="Enter your turnover for the year 2024"
						/>
						<Label for="revenue-for-past-four-months">Revenue For The Past Four Months Revenue</Label>
						<Input
							id="revenue-for-past-four-months"
							bind:value={$formData.pastFourMonthsTurnover}
							placeholder="Enter your revenue for the previous four months"
						/>
						<Label for="number-of-employees">Number Of Employees</Label>
						<Input
							id="number-of-employees"
							bind:value={$formData.businessNumberOfEmployees}
							placeholder="Enter your revenue for the year 2024"
						/>
						<Label for="business-growth-rate">Business Growth Rate</Label>
						<Input
							id="business-growth-rate"
							bind:value={$formData.businessGrowthRate}
							placeholder="Enter your growth rate"
						/>
						<Label for="sars-registration">Registered with SARS?</Label>

						<Select.Root
							selected={selectedRegisteredWithSARS}
							onSelectedChange={(v) => {
    if (v) {
      $formData.registeredWithSARS = v.value;
    }
  }}
						>
							<Select.Trigger id="sars-registration">
								<Select.Value placeholder="Select" />
							</Select.Trigger>
							<Select.Content>
								{#each participationOptions as option}
									<Select.Item value={option.value}>{option.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>

						<input hidden bind:value={$formData.registeredWithSARS} name="registeredWithSARS" />

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
						<Label for="motivation">Why do you want to join? (Min: 200 words)</Label>
						<Textarea
							id="motivation"
							bind:value={$formData.motivation}
							placeholder="Explain your motivation"
							on:input={() => minWordCount.motivation = countWords($formData.motivation)}
						/>
						<p class="word-count">Word count: {minWordCount.motivation} / 200</p>
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
					<Card.Content class="grid gap-6">
						<Label for="intervention-selection">Does Your Business Currently Have Any Form Of System In Use?</Label>
						<Accordion.Root type="multiple">
							{#each softwareAreas as area}
								<Accordion.Item value={area}>
									<!-- Click to expand -->
									<Accordion.Trigger>
										<div class="flex justify-between items-center w-full px-4 py-2 rounded-md cursor-pointer">
											<span class="font-semibold">{area}</span>
										</div>
									</Accordion.Trigger>
									<!-- Show checkboxes when clicked -->
									<Accordion.Content class="px-4 py-2 rounded-md">
										<div class="grid grid-cols-2 gap-4">
											<div>
													<div class="flex items-center gap-2 mb-2">
														<Checkbox
														/>
														<Label>Yes</Label>
													</div>
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
						<Label for="cipc-upload">Upload CIPC</Label>
						<Input
							id="cipc-upload"
							type="file"
							accept=".pdf,.doc,.docx,.jpg,.png"
							on:change={handleFileSelection}
						/>
						<Label for="bbbbee-certificate">Upload BBBEE Certificate</Label>
						<Input
							id="bbbbee-certificate"
							type="file"
							accept=".pdf,.doc,.docx,.jpg,.png"
							on:change={handleFileSelection}
						/>
						<Label for="company-profile-upload">Upload Company Profile</Label>
						<Input
							id="company-profile-upload"
							type="file"
							accept=".pdf,.doc,.docx,.jpg,.png"
							on:change={handleFileSelection}
						/>
						<Label for="id-copy">Upload Certified Copy Of ID</Label>
						<Input
							id="id-copy"
							type="file"
							accept=".pdf,.doc,.docx,.jpg,.png"
							on:change={handleFileSelection}
						/>
						<Label for="bank-statement-upload">Upload Business Bank Statement (last 3 months)
						</Label>
						<Input
							id="bank-statement-upload"
							type="file"
							accept=".pdf,.doc,.docx,.jpg,.png"
							on:change={handleFileSelection}
						/>
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

<style>
    .word-count {
        font-size: 0.9rem;
        color: gray;
        margin-top: 4px;
    }
    .word-count.warning {
        color: red;
    }
</style>
