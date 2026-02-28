<script>
  import { onMount } from 'svelte';
  import { register, getCars } from '$lib/api';
  import { fade, scale } from 'svelte/transition';

  let fullName = '';
  let mobile = '';
  let email = '';
  let idNumber = '';
  let carId = '';
  let salesConsultant = '';
  let branch = 'MAIN';
  let purposes = []; // Changed to array for multiple selection
  let loading = false;
  let loadingCars = false;
  let error = '';
  let success = null;
  let validationErrors = {};
  let cars = [];

  // Search and Edit
  let searchQuery = '';
  let searchResults = [];
  let showEditModal = false;
  let editingRegistration = null;
  let loadingSearch = false;

  // Test Drive specific
  let showTestDriveModal = false;
  let testDriveStep = 'id-scan'; // 'id-scan', 'waiver'
  let idFrontImage = null;
  let idBackImage = null;
  let signatureData = null;
  let isDrawing = false;
  let signatureCanvas = null;
  let lastX = 0;
  let lastY = 0;
  
  // Waiver form fields
  let waiverName = '';
  let waiverAddress = '';
  let waiverDate = '';
  let waiverLicenseNo = '';

  // Reservation specific
  let showReservationModal = false;
  let reservationStep = 'id-scan'; // 'id-scan', 'vehicle', 'payment'
  let govId1Front = null;
  let govId1Back = null;
  let govId2Front = null;
  let govId2Back = null;
  let paymentMode = '';
  
  // Vehicle selection
  let selectedVehicleModel = '';
  let selectedVariants = []; // Multiple variants can be selected
  let selectedColor = '';
  
  const variantOptions = [
    'Advance',
    'Dynamic', 
    'Premium',
    'Superior',
    'Captain'
  ];
  
  const colorOptions = [
    { value: 'white', label: 'White' },
    { value: 'gray', label: 'Gray' },
    { value: 'storm-gray', label: 'Storm Gray' },
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' }
  ];
  
  // Camera capture
  let showCamera = false;
  let cameraStream = null;
  let cameraVideo = null;
  let cameraCanvas = null;
  let currentCaptureTarget = null; // 'id1-front', 'id1-back', 'id2-front', 'id2-back', 'testdrive-front', 'testdrive-back'

  const salesConsultants = [
    'Rynel', 'Ron', 'Mary Joy', 'Meryln', 'April',
    'Angelie', 'Neil', 'Jeff', 'Markboy', 'Kristian'
  ];

  // Available car models (currently in stock) - exact matches from TV display
  const availableModels = [
    'byd atto 3',
    'byd dolphin',
    'byd emax 7',
    'byd shark 6',
    'byd seal 5',
    'byd sealion 5',
    'byd tang',
    'byd seagull'
  ];

  // Helper function to check if a car model is available (exact match only)
  function isCarAvailable(modelName) {
    const normalized = modelName.toLowerCase().trim();
    return availableModels.includes(normalized);
  }

  // Helper function to format car name with asterisk if available
  function formatCarName(modelName) {
    return isCarAvailable(modelName) ? `* ${modelName}` : modelName;
  }

  const purposeOptions = [
    { value: 'CIS', label: 'Customer Information Sheet' },
    { value: 'TEST_DRIVE', label: 'Test Drive' },
    { value: 'RESERVATION', label: 'Reservation' }
  ];

  async function loadCars() {
    loadingCars = true;
    error = '';
    try {
      const response = await getCars(branch);
      if (response.success) {
        cars = response.data.cars || [];
      }
    } catch (err) {
      error = err.message || 'Failed to load car models';
      cars = [];
    } finally {
      loadingCars = false;
    }
  }

  function validateForm() {
    validationErrors = {};
    
    if (!fullName.trim()) {
      validationErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      validationErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!mobile.trim()) {
      validationErrors.mobile = 'Mobile number is required';
    } else if (!/^[\d\s\+\-\(\)]+$/.test(mobile)) {
      validationErrors.mobile = 'Invalid mobile number format';
    } else if (mobile.replace(/\D/g, '').length < 10) {
      validationErrors.mobile = 'Mobile number must be at least 10 digits';
    }

    if (!salesConsultant) {
      validationErrors.salesConsultant = 'Please select a sales consultant';
    }

    if (!carId) {
      validationErrors.carId = 'Please select a vehicle model';
    }

    if (purposes.length === 0) {
      validationErrors.purposes = 'Please select at least one purpose';
    }

    return Object.keys(validationErrors).length === 0;
  }

  async function togglePurpose(purposeValue) {
    if (purposes.includes(purposeValue)) {
      purposes = purposes.filter(p => p !== purposeValue);
    } else {
      purposes = [...purposes, purposeValue];
    }
    
    // If Test Drive is selected and modal not shown yet, show it
    if (purposeValue === 'TEST_DRIVE' && purposes.includes('TEST_DRIVE') && !signatureData) {
      showTestDriveModal = true;
      testDriveStep = 'id-scan';
    }
    
    // If Reservation is selected and modal not shown yet, show it
    if (purposeValue === 'RESERVATION' && purposes.includes('RESERVATION') && !paymentMode) {
      // Load cars if not already loaded
      if (cars.length === 0) {
        await loadCars();
      }
      showReservationModal = true;
      reservationStep = 'id-scan';
    }
  }

  function handleFileUpload(event, type) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'front') {
          idFrontImage = e.target.result;
        } else {
          idBackImage = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function proceedToWaiver() {
    if (!idFrontImage || !idBackImage) {
      alert('Please upload both front and back of your ID');
      return;
    }
    if (!idNumber || idNumber.trim() === '') {
      alert('Please enter your license number');
      return;
    }
    // Pre-fill waiver fields with registration data
    waiverName = fullName;
    waiverAddress = mobile;
    waiverDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    testDriveStep = 'waiver';
    setTimeout(() => {
      initSignatureCanvas();
    }, 100);
  }

  function saveWaiverAndComplete() {
    if (!waiverName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!waiverDate.trim()) {
      alert('Please enter the date');
      return;
    }
    if (!signatureCanvas) {
      alert('Signature canvas not initialized');
      return;
    }
    
    // Check if signature canvas is empty
    const ctx = signatureCanvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, signatureCanvas.width, signatureCanvas.height);
    const isEmpty = !imageData.data.some(channel => channel !== 0);
    
    if (isEmpty) {
      alert('Please sign the waiver');
      return;
    }
    
    signatureData = signatureCanvas.toDataURL('image/png');
    completeTestDrive();
  }

  function initSignatureCanvas() {
    if (!signatureCanvas) return;
    
    const ctx = signatureCanvas.getContext('2d');
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  function startDrawing(e) {
    isDrawing = true;
    const rect = signatureCanvas.getBoundingClientRect();
    lastX = e.clientX - rect.left || e.touches[0].clientX - rect.left;
    lastY = e.clientY - rect.top || e.touches[0].clientY - rect.top;
  }

  function draw(e) {
    if (!isDrawing) return;
    
    // Don't prevent default for touch events to avoid the warning
    if (e.type === 'mousemove') {
      e.preventDefault();
    }
    
    const rect = signatureCanvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    
    const ctx = signatureCanvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    lastX = x;
    lastY = y;
  }

  function stopDrawing() {
    isDrawing = false;
  }

  function clearSignature() {
    if (!signatureCanvas) return;
    const ctx = signatureCanvas.getContext('2d');
    ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  }

  function saveSignature() {
    if (!signatureCanvas) return;
    signatureData = signatureCanvas.toDataURL('image/png');
    completeTestDrive();
  }

  async function completeTestDrive() {
    try {
      // Send test drive documents to server
      const response = await fetch('http://localhost:3001/api/testdrive/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          mobile: mobile.trim(),
          idNumber: idNumber.trim(),
          idFront: idFrontImage,
          idBack: idBackImage,
          signature: signatureData
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        console.error('Failed to save test drive documents:', result.message);
        alert('Failed to save documents. Please try again.');
        return;
      }

      console.log('Test Drive documents saved successfully:', result.data);
      showTestDriveModal = false;
      // Proceed with registration
    } catch (err) {
      console.error('Error saving test drive documents:', err);
      alert('Failed to save documents. Please try again.');
    }
  }

  function closeTestDriveModal() {
    showTestDriveModal = false;
    // Remove TEST_DRIVE from purposes if they cancel
    purposes = purposes.filter(p => p !== 'TEST_DRIVE');
    idFrontImage = null;
    idBackImage = null;
    signatureData = null;
    testDriveStep = 'id-scan';
  }

  // Reservation Modal Functions
  function handleReservationFileUpload(event, type) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'id1-front') {
          govId1Front = e.target.result;
        } else if (type === 'id1-back') {
          govId1Back = e.target.result;
        } else if (type === 'id2-front') {
          govId2Front = e.target.result;
        } else if (type === 'id2-back') {
          govId2Back = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function proceedToVehicleSelection() {
    // Require at least one complete ID (front and back)
    const hasId1 = govId1Front && govId1Back;
    const hasId2 = govId2Front && govId2Back;
    
    if (!hasId1 && !hasId2) {
      alert('Please upload at least one government ID (front and back)');
      return;
    }
    reservationStep = 'vehicle';
  }

  function proceedToPayment() {
    if (!selectedVehicleModel) {
      alert('Please select a vehicle model');
      return;
    }
    // Variants and color are now optional
    reservationStep = 'payment';
  }

  function toggleVariant(variant) {
    if (selectedVariants.includes(variant)) {
      selectedVariants = selectedVariants.filter(v => v !== variant);
    } else {
      selectedVariants = [...selectedVariants, variant];
    }
  }

  async function completeReservation() {
    if (!paymentMode) {
      alert('Please select a payment mode');
      return;
    }

    try {
      // Send reservation documents to server
      const response = await fetch('http://localhost:3001/api/reservation/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          mobile: mobile.trim(),
          govId1Front,
          govId1Back,
          govId2Front,
          govId2Back,
          paymentMode,
          vehicleModel: selectedVehicleModel,
          variants: selectedVariants.join(', '),
          color: selectedColor
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        console.error('Failed to save reservation documents:', result.message);
        alert('Failed to save documents. Please try again.');
        return;
      }

      console.log('Reservation documents saved successfully:', result.data);
      showReservationModal = false;
      // Proceed with registration
    } catch (err) {
      console.error('Error saving reservation documents:', err);
      alert('Failed to save documents. Please try again.');
    }
  }

  function closeReservationModal() {
    showReservationModal = false;
    // Remove RESERVATION from purposes if they cancel
    purposes = purposes.filter(p => p !== 'RESERVATION');
    govId1Front = null;
    govId1Back = null;
    govId2Front = null;
    govId2Back = null;
    paymentMode = '';
    selectedVehicleModel = '';
    selectedVariants = [];
    selectedColor = '';
    reservationStep = 'id-scan';
  }

  async function handleSubmit() {
    error = '';
    success = null;
    
    if (!validateForm()) {
      return;
    }

    // If Test Drive is selected and modal not completed, show modal
    if (purposes.includes('TEST_DRIVE') && !signatureData) {
      showTestDriveModal = true;
      return;
    }

    // If Reservation is selected and modal not completed, show modal
    if (purposes.includes('RESERVATION') && !paymentMode) {
      showReservationModal = true;
      return;
    }

    loading = true;

    try {
      const selectedCar = cars.find(c => c.carId === carId);
      const selectedModel = selectedCar ? selectedCar.model : 'N/A';
      
      console.log('Submitting registration:', {
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        carId,
        salesConsultant,
        branch,
        purposes: purposes.join(',') // Send as comma-separated string
      });
      
      const result = await register({ 
        fullName: fullName.trim(), 
        mobile: mobile.trim(),
        email: email ? email.trim() : null,
        idNumber: idNumber ? idNumber.trim() : null,
        carId,
        salesConsultant,
        branch,
        purpose: purposes.join(','), // Backend expects 'purpose' field
        paymentMode: paymentMode || null
      });
      
      console.log('Registration result:', result);
      
      if (result.success) {
        // Different success screens based on purposes
        const isCISOnly = purposes.length === 1 && purposes.includes('CIS');
        const hasQueue = purposes.includes('TEST_DRIVE') || purposes.includes('RESERVATION');
        
        success = {
          ...result.data,
          modelName: selectedModel,
          isCIS: isCISOnly,
          purposes: purposes,
          hasQueue: hasQueue
        };
        fullName = '';
        mobile = '';
        email = '';
        idNumber = '';
        carId = '';
        salesConsultant = '';
        purposes = [];
        validationErrors = {};
        idFrontImage = null;
        idBackImage = null;
        signatureData = null;
        govId1Front = null;
        govId1Back = null;
        govId2Front = null;
        govId2Back = null;
        paymentMode = '';
      } else {
        // Show detailed error message
        if (result.details && Array.isArray(result.details)) {
          const errorMessages = result.details.map(d => `${d.field}: ${d.message}`).join('\n');
          error = `Validation errors:\n${errorMessages}`;
          console.error('Validation details:', result.details);
        } else {
          error = result.message || result.error || 'Registration failed';
        }
        console.error('Registration error:', result);
      }
    } catch (err) {
      error = err.message || 'Registration failed. Please try again.';
      console.error('Registration exception:', err);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadCars();
  });

  // Camera capture functions
  async function openCamera(target) {
    currentCaptureTarget = target;
    showCamera = true;
    
    try {
      // Request camera access
      cameraStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use rear camera on mobile
      });
      
      // Wait for video element to be available
      setTimeout(() => {
        if (cameraVideo) {
          cameraVideo.srcObject = cameraStream;
        }
      }, 100);
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Unable to access camera. Please check permissions.');
      closeCamera();
    }
  }

  function capturePhoto() {
    if (!cameraVideo || !cameraCanvas) return;
    
    const context = cameraCanvas.getContext('2d');
    cameraCanvas.width = cameraVideo.videoWidth;
    cameraCanvas.height = cameraVideo.videoHeight;
    context.drawImage(cameraVideo, 0, 0);
    
    const imageData = cameraCanvas.toDataURL('image/jpeg', 0.8);
    
    // Assign to appropriate variable
    switch(currentCaptureTarget) {
      case 'testdrive-front':
        idFrontImage = imageData;
        break;
      case 'testdrive-back':
        idBackImage = imageData;
        break;
      case 'id1-front':
        govId1Front = imageData;
        break;
      case 'id1-back':
        govId1Back = imageData;
        break;
      case 'id2-front':
        govId2Front = imageData;
        break;
      case 'id2-back':
        govId2Back = imageData;
        break;
    }
    
    closeCamera();
  }

  function closeCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
    showCamera = false;
    currentCaptureTarget = null;
  }

  // Search function
  async function handleSearch() {
    if (!searchQuery.trim()) {
      searchResults = [];
      return;
    }

    // Only search if query is at least 2 characters
    if (searchQuery.trim().length < 2) {
      searchResults = [];
      return;
    }

    loadingSearch = true;
    try {
      const { searchRegistrations } = await import('$lib/api');
      const result = await searchRegistrations(searchQuery.trim(), branch);
      if (result.success) {
        searchResults = result.data || [];
      }
    } catch (err) {
      console.error('Search error:', err);
      searchResults = [];
    } finally {
      loadingSearch = false;
    }
  }

  // Open edit modal
  async function openEditModal(registration) {
    console.log('Opening edit modal with:', registration);
    
    // Load cars if not already loaded
    if (cars.length === 0) {
      await loadCars();
    }
    
    console.log('Cars loaded:', cars.length);
    console.log('Sales consultants:', salesConsultants);
    
    // Find the carId from the model name if carId is not present
    let carId = registration.carId || '';
    if (!carId && registration.model && cars.length > 0) {
      const matchingCar = cars.find(car => car.model === registration.model);
      if (matchingCar) {
        carId = matchingCar.carId;
        console.log('Matched car:', matchingCar);
      }
    }
    
    // Handle sales consultant
    let salesConsultant = registration.salesConsultant || '';
    if (salesConsultant) {
      salesConsultant = salesConsultant.trim();
      console.log('Sales consultant from data:', salesConsultant);
    }
    
    editingRegistration = { 
      ...registration,
      carId: carId,
      salesConsultant: salesConsultant
    };
    
    console.log('Editing registration set to:', editingRegistration);
    showEditModal = true;
  }

  // Close edit modal
  function closeEditModal() {
    showEditModal = false;
    editingRegistration = null;
  }

  // Save edited registration
  async function saveEdit() {
    if (!editingRegistration) return;

    // Validate required fields
    if (!editingRegistration.fullName || !editingRegistration.fullName.trim()) {
      alert('Full name is required');
      return;
    }
    if (!editingRegistration.mobile || !editingRegistration.mobile.trim()) {
      alert('Mobile number is required');
      return;
    }

    loading = true;
    error = '';
    
    try {
      const updateData = {
        fullName: editingRegistration.fullName.trim(),
        mobile: editingRegistration.mobile.trim(),
        email: editingRegistration.email?.trim() || '',
        salesConsultant: editingRegistration.salesConsultant || ''
      };

      // Only include carId if it's not empty
      if (editingRegistration.carId && editingRegistration.carId.trim()) {
        updateData.carId = editingRegistration.carId;
      }

      console.log('Updating registration:', editingRegistration.id, updateData);

      const { updateRegistration } = await import('$lib/api');
      const result = await updateRegistration(editingRegistration.id, updateData);

      console.log('Update result:', result);

      if (result.success) {
        alert('Registration updated successfully!');
        closeEditModal();
        // Refresh search results
        if (searchQuery) {
          await handleSearch();
        }
      } else {
        const errorMsg = result.message || result.error || 'Failed to update registration';
        alert(errorMsg);
        console.error('Update failed:', result);
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to update registration';
      alert(errorMsg);
      console.error('Update exception:', err);
    } finally {
      loading = false;
    }
  }

</script>

<svelte:head>
  <title>BYD Iloilo - Registration</title>
</svelte:head>

<div class="min-h-screen bg-white">
  {#if success}
    <!-- Success State -->
    <div class="min-h-screen flex items-center justify-center p-6">
      <div class="max-w-2xl w-full text-center space-y-8">
        {#if success.hasQueue}
          <!-- Has Queue Number (Test Drive or Reservation) -->
          <div class="space-y-4">
            <div class="text-6xl">✓</div>
            <h1 class="text-5xl font-bold text-gray-900 tracking-tight">You're registered</h1>
            <p class="text-xl text-gray-600">Your queue number</p>
          </div>
          
          <div class="bg-gray-50 rounded-3xl p-12">
            <div class="text-8xl font-bold text-gray-900 tracking-tight">{success.queueNo}</div>
          </div>
          
          <div class="space-y-4 text-gray-600">
            <!-- BYD Logo -->
            <div class="flex justify-center mb-4">
              <svg class="w-24 h-24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="20" fill="#0071E3"/>
                <text x="50" y="60" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">BYD</text>
              </svg>
            </div>
            <p class="text-lg text-gray-500">BYD Model:</p>
            <p class="text-2xl font-semibold text-gray-900">{success.modelName}</p>
            
            <!-- Show selected purposes -->
            <div class="mt-4 flex flex-wrap justify-center gap-2">
              {#each success.purposes as purpose}
                <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {purpose === 'CIS' ? 'Customer Info' : purpose === 'TEST_DRIVE' ? 'Test Drive' : 'Reservation'}
                </span>
              {/each}
            </div>
            
            <p class="text-lg mt-4">
              {#if success.purposes.length > 1 && (success.purposes.includes('TEST_DRIVE') || success.purposes.includes('RESERVATION'))}
                This queue number covers all selected services
              {:else}
                Please wait for your number to be called
              {/if}
            </p>
          </div>
        {:else}
          <!-- CIS Only - No Queue Number -->
          <div class="space-y-4">
            <div class="text-6xl">✓</div>
            <h1 class="text-5xl font-bold text-gray-900 tracking-tight">Information Recorded</h1>
            <p class="text-xl text-gray-600">Thank you for your interest</p>
          </div>
          
          <div class="space-y-4 text-gray-600">
            <!-- BYD Logo -->
            <div class="flex justify-center mb-4">
              <svg class="w-24 h-24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="20" fill="#0071E3"/>
                <text x="50" y="60" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">BYD</text>
              </svg>
            </div>
            <p class="text-lg text-gray-500">BYD Model:</p>
            <p class="text-2xl font-semibold text-gray-900">{success.modelName}</p>
            <p class="text-lg mt-4">Your information has been recorded successfully</p>
            <p class="text-base text-gray-500">Our sales consultant will contact you shortly</p>
          </div>
        {/if}
        
        <button
          on:click={() => success = null}
          class="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-colors duration-200"
        >
          Register Another
        </button>
      </div>
    </div>
  {:else}
    <!-- Registration Form -->
    <div class="max-w-3xl mx-auto px-6 py-16">
      <div class="text-center mb-12 space-y-4">
        <h1 class="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">Registration</h1>
        <p class="text-xl text-gray-600">Get your queue number for BYD Iloilo</p>
      </div>

      <!-- Search Section -->
      <div class="mb-8 p-6 bg-gray-50 rounded-2xl">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Search & Edit Registration</h3>
        <div class="flex gap-3">
          <input
            type="text"
            bind:value={searchQuery}
            on:input={handleSearch}
            placeholder="Search by name or queue number..."
            class="flex-1 px-4 py-3 text-base rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
          />
          {#if loadingSearch}
            <div class="px-4 py-3 text-gray-500">Searching...</div>
          {/if}
        </div>

        {#if searchResults.length > 0}
          <div class="mt-4 space-y-2 max-h-64 overflow-y-auto">
            {#each searchResults as result}
              <div class="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center hover:border-blue-600 transition-colors">
                <div class="flex-1">
                  <p class="font-semibold text-gray-900">{result.fullName}</p>
                  <p class="text-sm text-gray-600">Queue: {result.queueNo || 'N/A'} • Mobile: {result.mobile}</p>
                  <p class="text-sm text-gray-500">Car: {result.model || 'N/A'} • SC: {result.salesConsultant || 'Not assigned'}</p>
                  
                  <!-- Status Indicators -->
                  <div class="flex gap-2 mt-2">
                    {#if result.purpose && Array.isArray(result.purpose)}
                      {#if result.purpose.includes('CIS')}
                        <span class="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                          ✓ CIS
                        </span>
                      {/if}
                      {#if result.purpose.includes('TEST_DRIVE')}
                        <span class="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                          ✓ Test Drive
                        </span>
                      {/if}
                      {#if result.purpose.includes('RESERVATION')}
                        <span class="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">
                          ✓ Reservation
                        </span>
                      {/if}
                    {:else if typeof result.purpose === 'string'}
                      {#if result.purpose.includes('CIS')}
                        <span class="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                          ✓ CIS
                        </span>
                      {/if}
                      {#if result.purpose.includes('TEST_DRIVE')}
                        <span class="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                          ✓ Test Drive
                        </span>
                      {/if}
                      {#if result.purpose.includes('RESERVATION')}
                        <span class="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">
                          ✓ Reservation
                        </span>
                      {/if}
                    {/if}
                  </div>
                </div>
                <button
                  type="button"
                  on:click={() => openEditModal(result)}
                  class="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
              </div>
            {/each}
          </div>
        {:else if searchQuery && !loadingSearch}
          <p class="mt-4 text-sm text-gray-500 text-center">No results found</p>
        {/if}
      </div>

      {#if error}
        <div class="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl">
          <p class="font-semibold mb-2">Error</p>
          <pre class="text-sm whitespace-pre-wrap">{error}</pre>
        </div>
      {/if}

      <form on:submit|preventDefault={handleSubmit} class="space-y-6">
        <!-- Full Name -->
        <div class="space-y-2">
          <label for="fullName" class="block text-sm font-semibold text-gray-900">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            bind:value={fullName}
            required
            maxlength="100"
            class="w-full px-4 py-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            class:border-red-500={validationErrors.fullName}
            placeholder="Juan Dela Cruz"
          />
          {#if validationErrors.fullName}
            <p class="text-sm text-red-600">{validationErrors.fullName}</p>
          {/if}
        </div>

        <!-- Mobile Number -->
        <div class="space-y-2">
          <label for="mobile" class="block text-sm font-semibold text-gray-900">
            Mobile Number
          </label>
          <input
            id="mobile"
            type="tel"
            bind:value={mobile}
            required
            class="w-full px-4 py-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            class:border-red-500={validationErrors.mobile}
            placeholder="+63 912 345 6789"
          />
          {#if validationErrors.mobile}
            <p class="text-sm text-red-600">{validationErrors.mobile}</p>
          {/if}
        </div>

        <!-- Email (Optional) -->
        <div class="space-y-2">
          <label for="email" class="block text-sm font-semibold text-gray-900">
            Email Address <span class="text-gray-500 font-normal">(Optional)</span>
          </label>
          <input
            id="email"
            type="email"
            bind:value={email}
            class="w-full px-4 py-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            placeholder="your.email@example.com"
          />
        </div>

        <!-- Vehicle Model -->
        <div class="space-y-2">
          <label for="carId" class="block text-sm font-semibold text-gray-900">
            Vehicle of Interest
          </label>
          {#if loadingCars}
            <div class="w-full px-4 py-4 rounded-xl bg-gray-50 text-gray-500">
              Loading models...
            </div>
          {:else if cars.length === 0}
            <div class="w-full px-4 py-4 rounded-xl bg-gray-50 text-gray-500">
              No models available
            </div>
          {:else}
            <select
              id="carId"
              bind:value={carId}
              required
              class="w-full px-4 py-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white"
              class:border-red-500={validationErrors.carId}
            >
              <option value="">Select a BYD model</option>
              {#each cars as car}
                <option value={car.carId}>{formatCarName(car.model)}</option>
              {/each}
            </select>
          {/if}
          {#if validationErrors.carId}
            <p class="text-sm text-red-600">{validationErrors.carId}</p>
          {/if}
        </div>

        <!-- Sales Consultant -->
        <div class="space-y-2">
          <label for="salesConsultant" class="block text-sm font-semibold text-gray-900">
            Sales Consultant
          </label>
          <select
            id="salesConsultant"
            bind:value={salesConsultant}
            required
            class="w-full px-4 py-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white"
            class:border-red-500={validationErrors.salesConsultant}
          >
            <option value="">Select a sales consultant</option>
            {#each salesConsultants as consultant}
              <option value={consultant}>{consultant}</option>
            {/each}
          </select>
          {#if validationErrors.salesConsultant}
            <p class="text-sm text-red-600">{validationErrors.salesConsultant}</p>
          {/if}
        </div>

        <!-- Purpose Selection -->
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-900">
            Purpose (Select one or more)
          </label>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            {#each purposeOptions as purposeOption}
              <button
                type="button"
                on:click={() => togglePurpose(purposeOption.value)}
                class="px-4 py-4 rounded-xl border-2 transition-all text-left"
                class:border-blue-600={purposes.includes(purposeOption.value)}
                class:bg-blue-50={purposes.includes(purposeOption.value)}
                class:border-gray-300={!purposes.includes(purposeOption.value)}
                class:hover:border-gray-400={!purposes.includes(purposeOption.value)}
              >
                <div class="flex items-center gap-3">
                  <div class="w-5 h-5 rounded border-2 flex items-center justify-center"
                    class:border-blue-600={purposes.includes(purposeOption.value)}
                    class:bg-blue-600={purposes.includes(purposeOption.value)}
                    class:border-gray-300={!purposes.includes(purposeOption.value)}
                  >
                    {#if purposes.includes(purposeOption.value)}
                      <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                      </svg>
                    {/if}
                  </div>
                  <span class="font-medium text-gray-900">{purposeOption.label}</span>
                </div>
              </button>
            {/each}
          </div>
          {#if validationErrors.purposes}
            <p class="text-sm text-red-600">{validationErrors.purposes}</p>
          {/if}
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          disabled={loading || Object.keys(validationErrors).length > 0}
          class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </form>
    </div>
  {/if}
</div>

<!-- Test Drive Modal -->
{#if showTestDriveModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" transition:fade>
    <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" transition:scale>
      {#if testDriveStep === 'id-scan'}
        <!-- ID Scanning Step -->
        <div class="p-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">Upload Driver's License</h2>
          <p class="text-gray-600 mb-8">Please scan or upload both sides of your driver's license</p>
          
          <div class="space-y-6">
            <!-- Front ID -->
            <div class="space-y-3">
              <label class="block text-sm font-semibold text-gray-900">Front of ID</label>
              <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-600 transition-colors">
                {#if idFrontImage}
                  <img src={idFrontImage} alt="ID Front" class="max-h-48 mx-auto mb-4 rounded-lg" />
                  <button
                    type="button"
                    on:click={() => idFrontImage = null}
                    class="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                {:else}
                  <div class="space-y-3">
                    <button
                      type="button"
                      on:click={() => openCamera('testdrive-front')}
                      class="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      <div class="text-3xl mb-1">📷</div>
                      <div>Capture with Camera</div>
                    </button>
                    <div class="text-center text-sm text-gray-500">or</div>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      on:change={(e) => handleFileUpload(e, 'front')}
                      class="hidden"
                      id="id-front"
                    />
                    <label for="id-front" class="block">
                      <div class="w-full py-3 px-6 border-2 border-gray-300 hover:border-blue-600 text-gray-700 font-semibold rounded-lg transition-colors cursor-pointer text-center">
                        Upload from Gallery
                      </div>
                    </label>
                  </div>
                {/if}
              </div>
            </div>

            <!-- Back ID -->
            <div class="space-y-3">
              <label class="block text-sm font-semibold text-gray-900">Back of ID</label>
              <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-600 transition-colors">
                {#if idBackImage}
                  <img src={idBackImage} alt="ID Back" class="max-h-48 mx-auto mb-4 rounded-lg" />
                  <button
                    type="button"
                    on:click={() => idBackImage = null}
                    class="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                {:else}
                  <div class="space-y-3">
                    <button
                      type="button"
                      on:click={() => openCamera('testdrive-back')}
                      class="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      <div class="text-3xl mb-1">📷</div>
                      <div>Capture with Camera</div>
                    </button>
                    <div class="text-center text-sm text-gray-500">or</div>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      on:change={(e) => handleFileUpload(e, 'back')}
                      class="hidden"
                      id="id-back"
                    />
                    <label for="id-back" class="block">
                      <div class="w-full py-3 px-6 border-2 border-gray-300 hover:border-blue-600 text-gray-700 font-semibold rounded-lg transition-colors cursor-pointer text-center">
                        Upload from Gallery
                      </div>
                    </label>
                  </div>
                {/if}
              </div>
            </div>

            <!-- ID Number Input (shown after both IDs are uploaded) -->
            {#if idFrontImage && idBackImage}
              <div class="space-y-3 bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                <label for="testdrive-id-number" class="block text-sm font-semibold text-gray-900">
                  License Number
                  <span class="text-red-600">*</span>
                </label>
                <p class="text-sm text-gray-600 mb-2">Please enter the license number from your ID</p>
                <input
                  id="testdrive-id-number"
                  type="text"
                  bind:value={idNumber}
                  required
                  placeholder="e.g., N01-12-345678"
                  class="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            {/if}
          </div>

          <div class="flex gap-4 mt-8">
            <button
              type="button"
              on:click={closeTestDriveModal}
              class="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              on:click={proceedToWaiver}
              disabled={!idFrontImage || !idBackImage || !idNumber || idNumber.trim() === ''}
              class="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Waiver
            </button>
          </div>
        </div>
      {:else if testDriveStep === 'waiver'}
        <!-- Waiver Document Step with Signature -->
        <div class="p-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">Test Drive Waiver</h2>
          
          <div class="bg-white border-2 border-gray-900 rounded-xl p-8 max-h-[600px] overflow-y-auto mb-6 text-sm leading-relaxed text-black">
            <h3 class="font-bold text-xl text-center mb-6 uppercase">WAIVER AND RELEASE OF LIABILITY</h3>
            
            <div class="space-y-4">
              <p class="flex items-baseline gap-2 flex-wrap">
                I, Mr./Ms. 
                <input 
                  type="text" 
                  bind:value={waiverName}
                  class="border-b-2 border-black px-2 py-1 font-semibold min-w-[250px] focus:outline-none focus:border-blue-600"
                  placeholder="Enter your full name"
                />
                of 
                <input 
                  type="text" 
                  bind:value={waiverAddress}
                  class="border-b-2 border-black px-2 py-1 font-semibold min-w-[250px] focus:outline-none focus:border-blue-600"
                  placeholder="Enter address/contact"
                />
                hereby represent that I have a valid driver's license appropriate for the vehicle(s) indicated below, which I
                am permitted to test drive by CENTRAL EV INC. (BYD ILOILO):
              </p>

              <ul class="list-disc list-inside space-y-1 ml-4">
                <li>BYD DOLPHIN</li>
                <li>BYD ATTO 3 PREMIUM</li>
                <li>BYD TANG DM-I</li>
                <li>BYD SEALION 6</li>
                <li>BYD SEAGULL</li>
                <li>BYD SEAL5 DYNAMIC</li>
                <li>BYD SHARK 6 ADVANCE</li>
                <li>EMAX7</li>
                <li>TANG</li>
                <li>BYD SEALION 5</li>
              </ul>

              <div class="mt-6">
                <p class="mb-2">I. I hereby adhere to the following test drive protocols:</p>
                <div class="ml-8 space-y-2">
                  <p>A. Present a valid driver's license</p>
                  <p>B. Be at least nineteen years old</p>
                  <p>C. Drive within the designated route with an authorized Sales Consultant present</p>
                  <p class="ml-4"><span class="font-semibold">Route</span>- from BYD Showroom passing S&R going to SEDA and will turn left on the round about passing Stronghold Insurance Building and S&R then going back to the BYD Showroom</p>
                  <p class="ml-4">Total of 15 minutes Test Drive</p>
                  <p>D. Drive within the speed limit <span class="font-semibold">(30 kph to 40kph)</span></p>
                </div>
              </div>

              <p class="mt-4">
                II. I hereby waive and release any and all claims against CENTRAL EV INC. (BYD ILOILO) for any damages or injuries that may occur during the test drive of the above-mentioned vehicle(s).
              </p>

              <p>
                III. I acknowledge responsibility and liability for any damage to the vehicle(s) and to third parties.
              </p>

              <p>
                IV. In case of damage or accident, I will secure all necessary documents at my expense and cover any costs not covered by the company's insurance.
              </p>

              <div class="mt-8 flex justify-between items-start gap-8">
                <div class="flex-1">
                  <p class="text-xs mb-2 font-semibold">Signature Over Printed Name</p>
                  <!-- Signature Canvas positioned over printed name -->
                  <div class="relative mb-2">
                    <div class="border border-black rounded overflow-hidden bg-white">
                      <canvas
                        bind:this={signatureCanvas}
                        width="350"
                        height="80"
                        class="w-full touch-none cursor-crosshair"
                        style="touch-action: none;"
                        on:mousedown={startDrawing}
                        on:mousemove={draw}
                        on:mouseup={stopDrawing}
                        on:mouseleave={stopDrawing}
                        on:touchstart={startDrawing}
                        on:touchmove={draw}
                        on:touchend={stopDrawing}
                      ></canvas>
                    </div>
                  </div>
                  <!-- Printed name below signature -->
                  <div class="border-t-2 border-black pt-1">
                    <input 
                      type="text" 
                      bind:value={waiverName}
                      readonly
                      class="w-full px-2 py-1 font-semibold bg-transparent text-center text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    on:click={clearSignature}
                    class="mt-2 text-xs px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                  >
                    Clear Signature
                  </button>
                </div>
                <div class="flex-1">
                  <p class="text-xs mb-2 font-semibold">Date</p>
                  <input 
                    type="text" 
                    bind:value={waiverDate}
                    class="w-full border-b-2 border-black px-2 py-1 font-semibold focus:outline-none focus:border-blue-600"
                    placeholder="Enter date"
                  />
                </div>
              </div>

              <div class="mt-6">
                <p class="flex items-baseline gap-2">
                  Driver's License No.: 
                  <input 
                    type="text" 
                    bind:value={waiverLicenseNo}
                    class="flex-1 border-b-2 border-black px-2 py-1 focus:outline-none focus:border-blue-600"
                    placeholder="Enter license number"
                  />
                </p>
              </div>
            </div>
          </div>

          <div class="flex gap-4">
            <button
              type="button"
              on:click={() => testDriveStep = 'id-scan'}
              class="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              on:click={saveWaiverAndComplete}
              class="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
            >
              Save & Complete
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}


<!-- Reservation Modal -->
{#if showReservationModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" transition:fade>
    <div class="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" transition:scale>
      {#if reservationStep === 'id-scan'}
        <!-- Government IDs Upload Step -->
        <div class="p-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">Upload Government IDs</h2>
          <p class="text-gray-600 mb-8">Please upload 2 valid government IDs (front and back for each)</p>
          
          <div class="space-y-8">
            <!-- Government ID 1 -->
            <div class="border-2 border-gray-200 rounded-xl p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Government ID #1</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Front -->
                <div class="space-y-3">
                  <label class="block text-sm font-semibold text-gray-900">Front</label>
                  <div class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-600 transition-colors">
                    {#if govId1Front}
                      <img src={govId1Front} alt="ID 1 Front" class="max-h-40 mx-auto mb-4 rounded-lg" />
                      <button
                        type="button"
                        on:click={() => govId1Front = null}
                        class="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    {:else}
                      <div class="space-y-2">
                        <button
                          type="button"
                          on:click={() => openCamera('id1-front')}
                          class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                        >
                          <div class="text-2xl mb-1">📷</div>
                          <div class="text-sm">Capture</div>
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          on:change={(e) => handleReservationFileUpload(e, 'id1-front')}
                          class="hidden"
                          id="gov-id1-front"
                        />
                        <label for="gov-id1-front" class="block">
                          <div class="w-full py-2 px-4 border border-gray-300 hover:border-blue-600 text-gray-700 text-sm font-medium rounded-lg transition-colors cursor-pointer text-center">
                            Upload
                          </div>
                        </label>
                      </div>
                    {/if}
                  </div>
                </div>
                <!-- Back -->
                <div class="space-y-3">
                  <label class="block text-sm font-semibold text-gray-900">Back</label>
                  <div class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-600 transition-colors">
                    {#if govId1Back}
                      <img src={govId1Back} alt="ID 1 Back" class="max-h-40 mx-auto mb-4 rounded-lg" />
                      <button
                        type="button"
                        on:click={() => govId1Back = null}
                        class="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    {:else}
                      <div class="space-y-2">
                        <button
                          type="button"
                          on:click={() => openCamera('id1-back')}
                          class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                        >
                          <div class="text-2xl mb-1">📷</div>
                          <div class="text-sm">Capture</div>
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          on:change={(e) => handleReservationFileUpload(e, 'id1-back')}
                          class="hidden"
                          id="gov-id1-back"
                        />
                        <label for="gov-id1-back" class="block">
                          <div class="w-full py-2 px-4 border border-gray-300 hover:border-blue-600 text-gray-700 text-sm font-medium rounded-lg transition-colors cursor-pointer text-center">
                            Upload
                          </div>
                        </label>
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            </div>

            <!-- Government ID 2 -->
            <div class="border-2 border-gray-200 rounded-xl p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Government ID #2</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Front -->
                <div class="space-y-3">
                  <label class="block text-sm font-semibold text-gray-900">Front</label>
                  <div class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-600 transition-colors">
                    {#if govId2Front}
                      <img src={govId2Front} alt="ID 2 Front" class="max-h-40 mx-auto mb-4 rounded-lg" />
                      <button
                        type="button"
                        on:click={() => govId2Front = null}
                        class="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    {:else}
                      <div class="space-y-2">
                        <button
                          type="button"
                          on:click={() => openCamera('id2-front')}
                          class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                        >
                          <div class="text-2xl mb-1">📷</div>
                          <div class="text-sm">Capture</div>
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          on:change={(e) => handleReservationFileUpload(e, 'id2-front')}
                          class="hidden"
                          id="gov-id2-front"
                        />
                        <label for="gov-id2-front" class="block">
                          <div class="w-full py-2 px-4 border border-gray-300 hover:border-blue-600 text-gray-700 text-sm font-medium rounded-lg transition-colors cursor-pointer text-center">
                            Upload
                          </div>
                        </label>
                      </div>
                    {/if}
                  </div>
                </div>
                <!-- Back -->
                <div class="space-y-3">
                  <label class="block text-sm font-semibold text-gray-900">Back</label>
                  <div class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-600 transition-colors">
                    {#if govId2Back}
                      <img src={govId2Back} alt="ID 2 Back" class="max-h-40 mx-auto mb-4 rounded-lg" />
                      <button
                        type="button"
                        on:click={() => govId2Back = null}
                        class="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    {:else}
                      <div class="space-y-2">
                        <button
                          type="button"
                          on:click={() => openCamera('id2-back')}
                          class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                        >
                          <div class="text-2xl mb-1">📷</div>
                          <div class="text-sm">Capture</div>
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          on:change={(e) => handleReservationFileUpload(e, 'id2-back')}
                          class="hidden"
                          id="gov-id2-back"
                        />
                        <label for="gov-id2-back" class="block">
                          <div class="w-full py-2 px-4 border border-gray-300 hover:border-blue-600 text-gray-700 text-sm font-medium rounded-lg transition-colors cursor-pointer text-center">
                            Upload
                          </div>
                        </label>
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-4 mt-8">
            <button
              type="button"
              on:click={closeReservationModal}
              class="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              on:click={proceedToVehicleSelection}
              disabled={!(govId1Front && govId1Back) && !(govId2Front && govId2Back)}
              class="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Vehicle Selection
            </button>
          </div>
        </div>
      {:else if reservationStep === 'vehicle'}
        <!-- Vehicle Selection Step -->
        <div class="p-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">Select Vehicle</h2>
          
          <!-- Vehicle Preview -->
          <div class="mb-8 bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
            {#if selectedVehicleModel}
              {@const selectedCar = cars.find(c => c.model === selectedVehicleModel)}
              {#if selectedCar && selectedCar.imageUrl}
                <div class="text-center">
                  <img 
                    src={selectedCar.imageUrl} 
                    alt={selectedCar.model}
                    class="max-h-48 mx-auto rounded-lg object-contain mb-3"
                  />
                  <p class="text-lg font-semibold text-gray-900">{selectedCar.model}</p>
                </div>
              {:else}
                <div class="text-center py-8">
                  <div class="text-5xl mb-3">🚗</div>
                  <p class="text-lg font-semibold text-gray-900">{selectedVehicleModel}</p>
                  <p class="text-sm text-gray-500 mt-1">Preview not available</p>
                </div>
              {/if}
            {:else}
              <div class="text-center py-8">
                <div class="text-5xl mb-3">📋</div>
                <p class="text-lg font-semibold text-gray-500">Not yet selected car model</p>
                <p class="text-sm text-gray-400 mt-1">Please select a vehicle model below</p>
              </div>
            {/if}
          </div>
          
          <div class="space-y-6">
            <!-- Vehicle Model -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-gray-900">Vehicle Model</label>
              {#if loadingCars}
                <div class="w-full px-4 py-4 rounded-xl bg-gray-50 text-gray-500">
                  Loading models...
                </div>
              {:else if cars.length === 0}
                <div class="w-full px-4 py-4 rounded-xl bg-gray-50 text-gray-500">
                  No models available
                </div>
              {:else}
                <select
                  bind:value={selectedVehicleModel}
                  class="w-full px-4 py-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Select a BYD model</option>
                  {#each cars as car}
                    <option value={car.model}>{formatCarName(car.model)}</option>
                  {/each}
                </select>
              {/if}
            </div>

            <!-- Variants -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-gray-900">Variants (Optional - Select one or more)</label>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                {#each variantOptions as variant}
                  <button
                    type="button"
                    on:click={() => toggleVariant(variant)}
                    class="px-4 py-3 rounded-xl border-2 transition-all text-center"
                    class:border-blue-600={selectedVariants.includes(variant)}
                    class:bg-blue-50={selectedVariants.includes(variant)}
                    class:border-gray-300={!selectedVariants.includes(variant)}
                    class:hover:border-gray-400={!selectedVariants.includes(variant)}
                  >
                    <div class="flex items-center justify-center gap-2">
                      <div class="w-5 h-5 rounded border-2 flex items-center justify-center"
                        class:border-blue-600={selectedVariants.includes(variant)}
                        class:bg-blue-600={selectedVariants.includes(variant)}
                        class:border-gray-300={!selectedVariants.includes(variant)}
                      >
                        {#if selectedVariants.includes(variant)}
                          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                          </svg>
                        {/if}
                      </div>
                      <span class="font-medium text-gray-900">{variant}</span>
                    </div>
                  </button>
                {/each}
              </div>
            </div>

            <!-- Color -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-gray-900">Color (Optional)</label>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                {#each colorOptions as color}
                  <button
                    type="button"
                    on:click={() => selectedColor = color.value}
                    class="px-4 py-3 rounded-xl border-2 transition-all"
                    class:border-blue-600={selectedColor === color.value}
                    class:bg-blue-50={selectedColor === color.value}
                    class:border-gray-300={selectedColor !== color.value}
                    class:hover:border-gray-400={selectedColor !== color.value}
                  >
                    <span class="font-medium text-gray-900">{color.label}</span>
                  </button>
                {/each}
              </div>
            </div>
          </div>

          <div class="flex gap-4 mt-8">
            <button
              type="button"
              on:click={() => reservationStep = 'id-scan'}
              class="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              on:click={proceedToPayment}
              disabled={!selectedVehicleModel}
              class="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Payment Mode
            </button>
          </div>
        </div>
      {:else if reservationStep === 'payment'}
        <!-- Payment Mode Selection Step -->
        <div class="p-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">Select Payment Mode</h2>
          <p class="text-gray-600 mb-8">Choose your preferred payment method</p>
          
          <div class="space-y-4 mb-8">
            <label class="block text-sm font-semibold text-gray-900 mb-3">Payment Mode</label>
            <select
              bind:value={paymentMode}
              class="w-full px-4 py-4 text-lg rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white"
            >
              <option value="">Select payment mode</option>
              <option value="CASH">Cash</option>
              <option value="BANK">Bank</option>
              <option value="FINANCING">Financing</option>
            </select>
          </div>

          <div class="flex gap-4">
            <button
              type="button"
              on:click={() => reservationStep = 'vehicle'}
              class="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              on:click={completeReservation}
              disabled={!paymentMode}
              class="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}


<!-- Edit Registration Modal -->
{#if showEditModal && editingRegistration}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" transition:fade>
    <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" transition:scale>
      <div class="p-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-6">Edit Registration</h2>
        
        <div class="space-y-6">
          <!-- Queue Number (Read-only) -->
          {#if editingRegistration.queueNo}
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-gray-900">Queue Number</label>
              <div class="px-4 py-4 text-lg rounded-xl bg-gray-100 text-gray-700">
                {editingRegistration.queueNo}
              </div>
            </div>
          {/if}

          <!-- Full Name -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-900">Full Name</label>
            <input
              type="text"
              bind:value={editingRegistration.fullName}
              class="w-full px-4 py-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              placeholder="Juan Dela Cruz"
            />
          </div>

          <!-- Mobile Number -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-900">Mobile Number</label>
            <input
              type="tel"
              bind:value={editingRegistration.mobile}
              class="w-full px-4 py-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              placeholder="+63 912 345 6789"
            />
          </div>

          <!-- Email -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-900">Email Address <span class="text-gray-500 font-normal">(Optional)</span></label>
            <input
              type="email"
              bind:value={editingRegistration.email}
              class="w-full px-4 py-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              placeholder="your.email@example.com"
            />
          </div>

          <!-- Vehicle Model -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-900">Vehicle of Interest</label>
            <select
              bind:value={editingRegistration.carId}
              class="w-full px-4 py-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white"
            >
              <option value="">Select a BYD model</option>
              {#each cars as car}
                <option value={car.carId}>{formatCarName(car.model)}</option>
              {/each}
            </select>
          </div>

          <!-- Sales Consultant -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-900">Sales Consultant</label>
            <select
              bind:value={editingRegistration.salesConsultant}
              class="w-full px-4 py-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white"
            >
              <option value="" disabled>Select a sales consultant</option>
              {#each salesConsultants as consultant}
                <option value={consultant}>{consultant}</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="flex gap-4 mt-8">
          <button
            type="button"
            on:click={closeEditModal}
            class="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            on:click={saveEdit}
            disabled={loading}
            class="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Camera Capture Modal -->
{#if showCamera}
  <div class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50" transition:fade>
    <div class="bg-white rounded-2xl max-w-2xl w-full overflow-hidden" transition:scale>
      <div class="p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Capture Photo</h2>
        
        <!-- Video Preview -->
        <div class="relative bg-black rounded-xl overflow-hidden mb-4">
          <video
            bind:this={cameraVideo}
            autoplay
            playsinline
            class="w-full h-auto"
          ></video>
        </div>

        <!-- Hidden canvas for capturing -->
        <canvas bind:this={cameraCanvas} class="hidden"></canvas>

        <!-- Controls -->
        <div class="flex gap-4">
          <button
            type="button"
            on:click={closeCamera}
            class="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            on:click={capturePhoto}
            class="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
          >
            📷 Capture
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
