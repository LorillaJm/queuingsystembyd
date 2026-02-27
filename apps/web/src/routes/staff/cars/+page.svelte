<script>
  import { onMount } from 'svelte';
  import { getStaffCars, createCar, updateCar, toggleCarActive, deleteCar } from '$lib/api';

  // Authentication
  let pin = '';
  let authenticated = false;

  // Branch selection
  let selectedBranch = 'MAIN';
  const branches = [
    { code: 'MAIN', name: 'Main Branch' },
    { code: 'NORTH', name: 'North Branch' },
    { code: 'SOUTH', name: 'South Branch' }
  ];

  // Cars state
  let cars = [];
  let loading = false;
  let error = '';

  // Modal state
  let showModal = false;
  let modalMode = 'add'; // 'add' or 'edit'
  let editingCar = null;

  // Form state
  let formData = {
    model: '',
    capacity: 1,
    displayOrder: 1,
    imageUrl: ''
  };
  let formErrors = {};

  // Confirm dialog state
  let showConfirmDialog = false;
  let confirmAction = null;
  let confirmMessage = '';

  // Check authentication
  onMount(() => {
    const savedPin = sessionStorage.getItem('staffPin');
    if (savedPin) {
      pin = savedPin;
      authenticated = true;
      fetchCars();
    } else {
      // Redirect to staff login
      window.location.href = '/staff';
    }
  });

  // Fetch cars
  async function fetchCars() {
    loading = true;
    error = '';
    try {
      const response = await getStaffCars(pin, selectedBranch, true);
      if (response.success) {
        cars = response.data.cars || [];
      }
    } catch (err) {
      error = err.message || 'Failed to load cars';
      if (err.message.includes('401') || err.message.includes('Invalid')) {
        sessionStorage.removeItem('staffPin');
        window.location.href = '/staff';
      }
    } finally {
      loading = false;
    }
  }

  // Open add modal
  function openAddModal() {
    modalMode = 'add';
    editingCar = null;
    formData = {
      model: '',
      capacity: 1,
      displayOrder: cars.length + 1,
      imageUrl: ''
    };
    formErrors = {};
    showModal = true;
  }

  // Open edit modal
  function openEditModal(car) {
    modalMode = 'edit';
    editingCar = car;
    formData = {
      model: car.model,
      capacity: car.capacity,
      displayOrder: car.displayOrder,
      imageUrl: car.imageUrl || ''
    };
    formErrors = {};
    showModal = true;
  }

  // Close modal
  function closeModal() {
    showModal = false;
    editingCar = null;
    formData = {
      model: '',
      capacity: 1,
      displayOrder: 1,
      imageUrl: ''
    };
    formErrors = {};
  }

  // Validate form
  function validateForm() {
    formErrors = {};

    if (!formData.model.trim()) {
      formErrors.model = 'Model name is required';
    } else if (formData.model.trim().length < 2) {
      formErrors.model = 'Model name must be at least 2 characters';
    } else if (formData.model.trim().length > 60) {
      formErrors.model = 'Model name must be less than 60 characters';
    }

    if (formData.capacity < 1 || formData.capacity > 10) {
      formErrors.capacity = 'Capacity must be between 1 and 10';
    }

    if (formData.displayOrder < 1 || formData.displayOrder > 999) {
      formErrors.displayOrder = 'Display order must be between 1 and 999';
    }

    return Object.keys(formErrors).length === 0;
  }

  // Handle form submit
  async function handleSubmit() {
    if (!validateForm()) return;

    loading = true;
    error = '';

    try {
      const data = {
        branch: selectedBranch,
        model: formData.model.trim(),
        capacity: parseInt(formData.capacity),
        displayOrder: parseInt(formData.displayOrder),
        imageUrl: formData.imageUrl.trim() || undefined
      };

      if (modalMode === 'add') {
        const response = await createCar(pin, data);
        if (response.success) {
          await fetchCars();
          closeModal();
        }
      } else {
        const response = await updateCar(pin, editingCar.carId, {
          model: data.model,
          capacity: data.capacity,
          displayOrder: data.displayOrder,
          imageUrl: data.imageUrl
        });
        if (response.success) {
          await fetchCars();
          closeModal();
        }
      }
    } catch (err) {
      error = err.message || 'Failed to save car';
    } finally {
      loading = false;
    }
  }

  // Handle toggle active
  async function handleToggleActive(car) {
    if (car.isActive) {
      // Show confirmation for deactivation
      confirmMessage = `Are you sure you want to deactivate "${car.model}"? This will hide it from the registration form.`;
      confirmAction = async () => {
        await performToggle(car);
      };
      showConfirmDialog = true;
    } else {
      // Activate without confirmation
      await performToggle(car);
    }
  }

  async function performToggle(car) {
    loading = true;
    error = '';
    try {
      const response = await toggleCarActive(pin, car.carId);
      if (response.success) {
        await fetchCars();
      }
    } catch (err) {
      error = err.message || 'Failed to toggle car status';
    } finally {
      loading = false;
    }
  }

  // Handle delete
  function handleDelete(car) {
    confirmMessage = `Are you sure you want to delete "${car.model}"? This action cannot be undone.`;
    confirmAction = async () => {
      await performDelete(car);
    };
    showConfirmDialog = true;
  }

  async function performDelete(car) {
    loading = true;
    error = '';
    try {
      const response = await deleteCar(pin, car.carId);
      if (response.success) {
        await fetchCars();
      }
    } catch (err) {
      error = err.message || 'Failed to delete car';
    } finally {
      loading = false;
    }
  }

  // Confirm dialog actions
  function handleConfirm() {
    showConfirmDialog = false;
    if (confirmAction) {
      confirmAction();
      confirmAction = null;
    }
  }

  function handleCancel() {
    showConfirmDialog = false;
    confirmAction = null;
    confirmMessage = '';
  }

  // Branch change handler
  $: if (authenticated && selectedBranch) {
    fetchCars();
  }
</script>

<svelte:head>
  <title>Manage Cars - Staff Panel</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 p-4">
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-semibold">Manage Cars</h1>
        <p class="text-gray-600 mt-1">Add and manage vehicle models for test drives</p>
      </div>
      <a href="/staff" class="px-4 py-2 text-gray-600 hover:text-gray-900 transition">
        ← Back to Queue
      </a>
    </div>

    <!-- Branch Selector & Add Button -->
    <div class="mb-6 flex items-center justify-between gap-4">
      <div class="flex-1 max-w-xs">
        <label for="branch" class="block text-sm font-medium mb-2">Branch</label>
        <select
          id="branch"
          bind:value={selectedBranch}
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          {#each branches as branch}
            <option value={branch.code}>{branch.name}</option>
          {/each}
        </select>
      </div>
      <button
        on:click={openAddModal}
        class="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition font-medium"
      >
        + Add Car
      </button>
    </div>

    <!-- Error Display -->
    {#if error}
      <div class="mb-4 p-4 bg-red-50 text-red-600 rounded-xl flex justify-between items-center">
        <span>{error}</span>
        <button on:click={() => error = ''} class="text-red-800 hover:text-red-900">✕</button>
      </div>
    {/if}

    <!-- Loading State -->
    {#if loading && cars.length === 0}
      <div class="text-center py-12">
        <div class="text-gray-500">Loading cars...</div>
      </div>
    {:else if cars.length === 0}
      <!-- Empty State -->
      <div class="bg-white rounded-2xl shadow-sm p-12 text-center">
        <div class="text-4xl mb-4">🚗</div>
        <h3 class="text-xl font-semibold mb-2">No cars yet</h3>
        <p class="text-gray-600 mb-6">Add your first vehicle model to get started</p>
        <button
          on:click={openAddModal}
          class="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition font-medium"
        >
          + Add Car
        </button>
      </div>
    {:else}
      <!-- Cars Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each cars as car}
          <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition {!car.isActive ? 'opacity-60' : ''}">
            <!-- Car Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-lg font-semibold mb-1">{car.model}</h3>
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <span>Order: {car.displayOrder}</span>
                  <span>•</span>
                  <span>Capacity: {car.capacity}</span>
                </div>
              </div>
              <span class="px-2 py-1 text-xs rounded-full {car.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}">
                {car.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <!-- Car Image Placeholder -->
            {#if car.imageUrl}
              <div class="mb-4 rounded-lg overflow-hidden bg-gray-100">
                <img src={car.imageUrl} alt={car.model} class="w-full h-32 object-cover" />
              </div>
            {:else}
              <div class="mb-4 rounded-lg bg-gray-100 h-32 flex items-center justify-center text-gray-400">
                <span class="text-4xl">🚗</span>
              </div>
            {/if}

            <!-- Actions -->
            <div class="flex gap-2">
              <button
                on:click={() => openEditModal(car)}
                class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
              >
                Edit
              </button>
              <button
                on:click={() => handleToggleActive(car)}
                class="flex-1 px-4 py-2 rounded-lg transition text-sm font-medium {car.isActive ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}"
              >
                {car.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                on:click={() => handleDelete(car)}
                class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Add/Edit Modal -->
{#if showModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
      <h2 class="text-2xl font-semibold mb-6">
        {modalMode === 'add' ? 'Add New Car' : 'Edit Car'}
      </h2>

      <form on:submit|preventDefault={handleSubmit}>
        <!-- Model Name -->
        <div class="mb-4">
          <label for="model" class="block text-sm font-medium mb-2">Model Name *</label>
          <input
            id="model"
            type="text"
            bind:value={formData.model}
            required
            maxlength="60"
            class="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition {formErrors.model ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-900'}"
            placeholder="e.g., Toyota Camry"
          />
          {#if formErrors.model}
            <p class="mt-1 text-sm text-red-600">{formErrors.model}</p>
          {/if}
        </div>

        <!-- Capacity -->
        <div class="mb-4">
          <label for="capacity" class="block text-sm font-medium mb-2">Capacity *</label>
          <input
            id="capacity"
            type="number"
            bind:value={formData.capacity}
            required
            min="1"
            max="10"
            class="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition {formErrors.capacity ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-900'}"
          />
          {#if formErrors.capacity}
            <p class="mt-1 text-sm text-red-600">{formErrors.capacity}</p>
          {/if}
          <p class="mt-1 text-xs text-gray-500">Number of simultaneous test drives (1-10)</p>
        </div>

        <!-- Display Order -->
        <div class="mb-4">
          <label for="displayOrder" class="block text-sm font-medium mb-2">Display Order *</label>
          <input
            id="displayOrder"
            type="number"
            bind:value={formData.displayOrder}
            required
            min="1"
            max="999"
            class="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition {formErrors.displayOrder ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-900'}"
          />
          {#if formErrors.displayOrder}
            <p class="mt-1 text-sm text-red-600">{formErrors.displayOrder}</p>
          {/if}
          <p class="mt-1 text-xs text-gray-500">Lower numbers appear first (1-999)</p>
        </div>

        <!-- Image URL -->
        <div class="mb-6">
          <label for="imageUrl" class="block text-sm font-medium mb-2">Image URL (Optional)</label>
          <input
            id="imageUrl"
            type="url"
            bind:value={formData.imageUrl}
            maxlength="500"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="https://example.com/car.jpg"
          />
          <p class="mt-1 text-xs text-gray-500">Optional: URL to car image</p>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button
            type="button"
            on:click={closeModal}
            class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            class="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition font-medium disabled:opacity-50"
          >
            {loading ? 'Saving...' : modalMode === 'add' ? 'Add Car' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Confirm Dialog -->
{#if showConfirmDialog}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
      <h2 class="text-xl font-semibold mb-4">Confirm Action</h2>
      <p class="text-gray-600 mb-6">{confirmMessage}</p>
      <div class="flex gap-3">
        <button
          on:click={handleCancel}
          class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
        >
          Cancel
        </button>
        <button
          on:click={handleConfirm}
          class="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
{/if}
