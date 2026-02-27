<script>
  import { onMount } from 'svelte';
  import { register, getCars } from '$lib/api';

  let fullName = '';
  let mobile = '';
  let carId = '';
  let branch = 'MAIN'; // Fixed to MAIN (BYD ILOILO)
  let purpose = 'TEST_DRIVE'; // Fixed to TEST_DRIVE
  let loading = false;
  let loadingCars = false;
  let error = '';
  let success = null;
  let validationErrors = {};
  let cars = [];

  // Load cars on mount
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

  // Client-side validation
  function validateForm() {
    validationErrors = {};
    
    if (!fullName.trim()) {
      validationErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      validationErrors.fullName = 'Name must be at least 2 characters';
    } else if (fullName.trim().length > 100) {
      validationErrors.fullName = 'Name must be less than 100 characters';
    }

    if (!mobile.trim()) {
      validationErrors.mobile = 'Mobile number is required';
    } else if (!/^[\d\s\+\-\(\)]+$/.test(mobile)) {
      validationErrors.mobile = 'Invalid mobile number format';
    } else if (mobile.replace(/\D/g, '').length < 10) {
      validationErrors.mobile = 'Mobile number must be at least 10 digits';
    }

    if (!carId) {
      validationErrors.carId = 'Please select a vehicle model';
    }

    return Object.keys(validationErrors).length === 0;
  }

  async function handleSubmit() {
    error = '';
    success = null;
    
    // Client-side validation
    if (!validateForm()) {
      return;
    }

    loading = true;

    try {
      // Save the selected car model name before submitting
      const selectedCar = cars.find(c => c.carId === carId);
      const selectedModel = selectedCar ? selectedCar.model : 'N/A';
      
      const result = await register({ 
        fullName: fullName.trim(), 
        mobile: mobile.trim(), 
        carId,
        branch,
        purpose
      });
      
      if (result.success) {
        // Add the model name to the success data
        success = {
          ...result.data,
          modelName: selectedModel
        };
        // Reset form
        fullName = '';
        mobile = '';
        carId = '';
        validationErrors = {};
      } else {
        error = result.message || 'Registration failed';
      }
    } catch (err) {
      error = err.message || 'Registration failed. Please try again.';
    } finally {
      loading = false;
    }
  }

  // Real-time validation on blur
  function validateField(field) {
    if (field === 'fullName' && fullName) {
      if (fullName.trim().length < 2) {
        validationErrors.fullName = 'Name must be at least 2 characters';
      } else if (fullName.trim().length > 100) {
        validationErrors.fullName = 'Name must be less than 100 characters';
      } else {
        delete validationErrors.fullName;
      }
      validationErrors = validationErrors;
    }
    
    if (field === 'mobile' && mobile) {
      if (!/^[\d\s\+\-\(\)]+$/.test(mobile)) {
        validationErrors.mobile = 'Invalid mobile number format';
      } else if (mobile.replace(/\D/g, '').length < 10) {
        validationErrors.mobile = 'Mobile number must be at least 10 digits';
      } else {
        delete validationErrors.mobile;
      }
      validationErrors = validationErrors;
    }

    if (field === 'carId' && carId) {
      delete validationErrors.carId;
      validationErrors = validationErrors;
    }
  }

  // Load cars on mount and when branch changes
  onMount(() => {
    loadCars();
  });
</script>

<svelte:head>
  <title>BYD Iloilo - Queue Registration</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
  <!-- Event Header Banner -->
  <div class="bg-gradient-to-r from-red-700 via-red-600 to-red-700 border-b-4 border-yellow-400 relative overflow-hidden flex-shrink-0">
    <div class="absolute inset-0 opacity-10" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px);"></div>
    <div class="relative px-4 py-4 sm:py-6 text-center">
      <div class="flex items-center justify-center gap-2 mb-2">
        <span class="text-yellow-300 text-2xl sm:text-3xl">🏮</span>
        <div class="text-yellow-300 text-xs sm:text-sm font-bold tracking-widest">BYD ILOILO</div>
        <span class="text-yellow-300 text-2xl sm:text-3xl">🏮</span>
      </div>
      <h1 class="text-white font-bold text-xl sm:text-3xl tracking-wide drop-shadow-lg">
        PROSPERITY IN MOTION
      </h1>
      <p class="text-yellow-200 text-xs sm:text-sm mt-1 font-medium">
        Fuel Your Fortune • February 28, 2026
      </p>
    </div>
    <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400"></div>
  </div>

  <!-- Main Content -->
  <div class="flex-1 flex items-center justify-center p-4 sm:p-6">
    <div class="w-full max-w-md">
      {#if success}
        <!-- Success Card -->
        <div class="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center space-y-4">
          <div class="text-green-600 text-5xl mb-2">✓</div>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900">Registration Successful!</h2>
          
          <div class="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 sm:p-8 text-white">
            <p class="text-sm opacity-90 mb-2">Your Queue Number</p>
            <div class="text-5xl sm:text-6xl font-bold tracking-tight">{success.queueNo}</div>
          </div>
          
          <div class="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-600">Location:</span>
              <span class="font-semibold text-slate-900">BYD Iloilo Showroom</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">Model:</span>
              <span class="font-semibold text-slate-900">{success.modelName || 'N/A'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">Purpose:</span>
              <span class="font-semibold text-slate-900">Test Drive</span>
            </div>
          </div>
          
          <p class="text-sm text-slate-600 pt-2">
            Please wait for your number to be called. Thank you!
          </p>
          
          <button
            on:click={() => success = null}
            class="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Register Another Customer
          </button>
        </div>
      {:else}
        <!-- Registration Form -->
        <div class="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div class="text-center mb-6">
            <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Get Your Queue Number</h2>
            <p class="text-sm sm:text-base text-slate-600">Fill in your details to register</p>
          </div>

          {#if error}
            <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2">
              <span class="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          {/if}

          <form on:submit|preventDefault={handleSubmit} class="space-y-4">
            <!-- Full Name -->
            <div>
              <label for="fullName" class="block text-sm font-semibold text-slate-700 mb-2">
                Full Name <span class="text-red-600">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                bind:value={fullName}
                on:blur={() => validateField('fullName')}
                required
                maxlength="100"
                class="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all {validationErrors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-red-500 focus:ring-red-500'}"
                placeholder="Juan Dela Cruz"
              />
              {#if validationErrors.fullName}
                <p class="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <span>⚠</span> {validationErrors.fullName}
                </p>
              {/if}
            </div>

            <!-- Mobile Number -->
            <div>
              <label for="mobile" class="block text-sm font-semibold text-slate-700 mb-2">
                Mobile Number <span class="text-red-600">*</span>
              </label>
              <input
                id="mobile"
                type="tel"
                bind:value={mobile}
                on:blur={() => validateField('mobile')}
                required
                class="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all {validationErrors.mobile ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-red-500 focus:ring-red-500'}"
                placeholder="+63 912 345 6789"
              />
              {#if validationErrors.mobile}
                <p class="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <span>⚠</span> {validationErrors.mobile}
                </p>
              {/if}
            </div>

            <!-- Vehicle Model -->
            <div>
              <label for="carId" class="block text-sm font-semibold text-slate-700 mb-2">
                Vehicle of Interest <span class="text-red-600">*</span>
              </label>
              {#if loadingCars}
                <div class="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-500 text-sm">
                  Loading models...
                </div>
              {:else if cars.length === 0}
                <div class="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-500 text-sm">
                  No models available
                </div>
              {:else}
                <select
                  id="carId"
                  bind:value={carId}
                  on:blur={() => validateField('carId')}
                  required
                  class="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all bg-white {validationErrors.carId ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-red-500 focus:ring-red-500'}"
                >
                  <option value="">Select a BYD model</option>
                  {#each cars as car}
                    <option value={car.carId}>{car.model}</option>
                  {/each}
                </select>
              {/if}
              {#if validationErrors.carId}
                <p class="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <span>⚠</span> {validationErrors.carId}
                </p>
              {/if}
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              disabled={loading || Object.keys(validationErrors).length > 0}
              class="w-full mt-6 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Processing...' : 'Get My Queue Number'}
            </button>
          </form>
        </div>

        <!-- Quick Links -->
        <div class="mt-6 flex flex-wrap justify-center gap-3 text-xs sm:text-sm">
          <a href="/screen?branch=MAIN" class="px-4 py-2 bg-white rounded-lg text-slate-600 hover:text-red-600 hover:shadow-md transition-all">
            📺 TV Display
          </a>
          <a href="/mc?branch=MAIN" class="px-4 py-2 bg-white rounded-lg text-slate-600 hover:text-red-600 hover:shadow-md transition-all">
            🎤 MC View
          </a>
          <a href="/staff" class="px-4 py-2 bg-white rounded-lg text-slate-600 hover:text-red-600 hover:shadow-md transition-all">
            👤 Staff Panel
          </a>
        </div>
      {/if}
    </div>
  </div>
</div>
