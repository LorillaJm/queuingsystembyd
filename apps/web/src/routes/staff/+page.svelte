<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { getSocket } from '$lib/socket';
  import { getCars } from '$lib/api';
  import { fade } from 'svelte/transition';

  let socket, authenticated = false, pin = '', error = '', loading = false;
  let branch = 'MAIN', cars = [], tickets = [], lastUpdate = new Date();
  let successMessage = '';

  $: ticketsByModel = groupTicketsByModel(tickets, cars);

  // Available car models (only these 8 exact models from TV display)
  const availableBaseModels = [
    'byd atto 3',
    'byd dolphin',
    'byd emax 7',
    'byd shark 6',
    'byd seal 5',
    'byd sealion 5',
    'byd tang',
    'byd seagull'
  ];

  function isModelAvailable(modelName) {
    const normalized = modelName.toLowerCase().trim();
    return availableBaseModels.includes(normalized);
  }

  function groupTicketsByModel(tickets, cars) {
    const grouped = {};
    
    // Only include available car models
    const availableCars = cars.filter(car => isModelAvailable(car.model));
    console.log('Total cars:', cars.length);
    console.log('Available cars:', availableCars.length);
    console.log('Available car models:', availableCars.map(c => c.model));
    
    availableCars.forEach(car => {
      grouped[car.model] = { model: car.model, serving: null, waitingCount: 0 };
    });
    
    tickets.forEach(ticket => {
      // Only process tickets for available models
      if (grouped[ticket.model]) {
        if (ticket.status === 'SERVING') grouped[ticket.model].serving = ticket;
        else if (ticket.status === 'WAITING') grouped[ticket.model].waitingCount++;
      }
    });
    
    return Object.values(grouped);
  }

  async function handleLogin(e) {
    e.preventDefault();
    loading = true;
    error = '';
    try {
      const response = await fetch('http://localhost:3001/api/staff/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      const data = await response.json();
      if (data.success) {
        authenticated = true;
        localStorage.setItem('staffPin', pin);
        fetchData();
      } else {
        error = 'Invalid PIN';
      }
    } catch (err) {
      error = 'Authentication failed';
    } finally {
      loading = false;
    }
  }

  async function fetchCars() {
    try {
      const response = await getCars(branch);
      if (response.success) cars = response.data.cars || [];
    } catch (err) {
      console.error('Failed to fetch cars:', err);
    }
  }

  async function fetchTickets() {
    try {
      const storedPin = localStorage.getItem('staffPin');
      const response = await fetch(`http://localhost:3001/api/registrations?branch=${branch}`);
      const data = await response.json();
      if (data.success) {
        tickets = data.data.registrations || [];
        lastUpdate = new Date();
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    }
  }

  async function fetchData() {
    await fetchCars();
    await fetchTickets();
  }

  async function callNextForModel(model) {
    try {
      const storedPin = localStorage.getItem('staffPin');
      const response = await fetch('http://localhost:3001/api/staff/next-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Staff-Pin': storedPin
        },
        body: JSON.stringify({ branch, model })
      });
      const data = await response.json();
      if (data.success) {
        showSuccess(`Called ${data.data.queueNo} - ${data.data.fullName}`);
        fetchTickets();
      } else {
        alert(data.message || 'Failed to call next customer');
      }
    } catch (err) {
      alert('Failed to call next customer');
    }
  }

  async function markAsDone(queueNo) {
    if (!confirm('Mark this customer as done and call next?')) return;
    try {
      const storedPin = localStorage.getItem('staffPin');
      const response = await fetch('http://localhost:3001/api/staff/mark-done', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Staff-Pin': storedPin
        },
        body: JSON.stringify({ branch, queueNo })
      });
      const data = await response.json();
      if (data.success) {
        showSuccess(`${queueNo} marked as done!`);
        fetchTickets();
      } else {
        console.error('Mark done error:', data);
        // Show user-friendly error message
        let errorMsg = data.message || data.error || 'Failed to mark as done';
        
        // If there are validation details, show them
        if (data.details && Array.isArray(data.details)) {
          const validationErrors = data.details.map(d => `${d.field}: ${d.message}`).join(', ');
          errorMsg += `\nValidation errors: ${validationErrors}`;
        }
        
        alert(errorMsg);
      }
    } catch (err) {
      console.error('Mark done exception:', err);
      alert('Failed to mark as done. Please try again.');
    }
  }

  function showSuccess(message) {
    successMessage = message;
    setTimeout(() => {
      successMessage = '';
    }, 3000);
  }

  function downloadExcel() {
    // Filter active tickets
    const activeTickets = tickets.filter(t => t.status !== 'DONE' && t.status !== 'NOSHOW');
    
    if (activeTickets.length === 0) {
      alert('No customers to export');
      return;
    }

    // Create CSV content
    const headers = ['Queue #', 'Full Name', 'Email', 'Mobile', 'Vehicle Model', 'SC', 'Test Drive', 'Reservation', 'Remarks'];
    const csvRows = [headers.join(',')];
    
    activeTickets.forEach(ticket => {
      const row = [
        ticket.queueNo || '',
        `"${ticket.fullName || ''}"`,
        ticket.email || '',
        ticket.mobile || '',
        ticket.model || '',
        `"${ticket.salesConsultant || ''}"`,
        ticket.purpose && ticket.purpose.includes('TEST_DRIVE') ? 'Yes' : 'No',
        ticket.purpose && ticket.purpose.includes('RESERVATION') ? 'Yes' : 'No',
        ''
      ];
      csvRows.push(row.join(','));
    });

    // Create blob and download
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `customer-summary-${branch}-${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccess('Excel file downloaded successfully!');
  }

  function handleLogout() {
    authenticated = false;
    localStorage.removeItem('staffPin');
    pin = '';
  }

  function handleQueueUpdate() {
    fetchTickets();
  }

  onMount(() => {
    const storedPin = localStorage.getItem('staffPin');
    if (storedPin) {
      pin = storedPin;
      authenticated = true;
      fetchData();
    }
    socket = getSocket();
    socket.on('queue:updated', handleQueueUpdate);
    socket.on('ticket:called', handleQueueUpdate);
    const interval = setInterval(fetchTickets, 10000);
    return () => clearInterval(interval);
  });

  onDestroy(() => {
    if (socket) {
      socket.off('queue:updated', handleQueueUpdate);
      socket.off('ticket:called', handleQueueUpdate);
    }
  });
</script>

<svelte:head><title>Staff Panel - {branch}</title></svelte:head>

{#if !authenticated}
  <!-- Login Screen -->
  <div class="min-h-screen flex items-center justify-center bg-white">
    <div class="bg-white rounded-2xl border border-gray-200 p-10 w-full max-w-md mx-4">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-semibold text-gray-900 mb-2">Staff Login</h1>
        <p class="text-base text-gray-500">Enter your PIN to continue</p>
      </div>
      <form on:submit={handleLogin} class="space-y-5">
        <input 
          type="password" 
          bind:value={pin} 
          placeholder="Enter PIN" 
          class="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          required 
        />
        {#if error}
          <p class="text-red-600 text-sm text-center">{error}</p>
        {/if}
        <button 
          type="submit" 
          class="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  </div>
{:else}
  <!-- Staff Panel -->
  <div class="h-screen flex flex-col bg-white">
    <!-- Success Toast -->
    {#if successMessage}
      <div 
        class="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3"
        in:fade={{ duration: 200 }}
        out:fade={{ duration: 200 }}
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span class="font-semibold">{successMessage}</span>
      </div>
    {/if}

    <!-- Header -->
    <header class="bg-white border-b border-gray-200 flex-shrink-0">
      <div class="px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="bg-gray-100 text-gray-900 px-4 py-2 rounded-full font-semibold text-sm">
            {branch}
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Staff Control</h1>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-sm text-gray-500">{lastUpdate.toLocaleTimeString()}</div>
          <button 
            on:click={handleLogout}
            class="px-4 py-2 bg-gray-100 text-gray-900 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto p-6">
      <!-- Queue Management Table -->
      <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
        <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 class="text-lg font-bold text-gray-900">Queue Management</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead class="bg-gray-50 sticky top-0">
              <tr class="border-b border-gray-200">
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Model</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Serving</th>
                <th class="px-6 py-4 text-center text-xs font-semibold text-gray-900 uppercase tracking-wide">Waiting</th>
                <th class="px-6 py-4 text-center text-xs font-semibold text-gray-900 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each ticketsByModel as modelGroup (modelGroup.model)}
                <tr in:fade={{ duration: 300 }} class="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <!-- Model -->
                  <td class="px-6 py-4 align-middle">
                    <div class="font-semibold text-base text-gray-900 leading-tight">
                      {modelGroup.model}
                    </div>
                  </td>
                  
                  <!-- Currently Serving -->
                  <td class="px-6 py-4 align-middle">
                    {#if modelGroup.serving}
                      <div class="flex items-center gap-3">
                        <div class="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-base min-w-[70px] text-center">
                          {modelGroup.serving.queueNo}
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="font-semibold text-base text-gray-900 truncate">{modelGroup.serving.fullName}</div>
                          <div class="text-sm text-gray-500 truncate">{modelGroup.serving.mobile}</div>
                        </div>
                      </div>
                    {:else}
                      <span class="text-gray-400 text-base">No customer</span>
                    {/if}
                  </td>
                  
                  <!-- Waiting Count -->
                  <td class="px-6 py-4 align-middle text-center">
                    <span class="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 text-gray-900 text-sm font-semibold">
                      {modelGroup.waitingCount}
                    </span>
                  </td>
                  
                  <!-- Actions -->
                  <td class="px-6 py-4 align-middle">
                    <div class="flex items-center justify-center gap-2">
                      {#if modelGroup.serving}
                        <button 
                          on:click={() => markAsDone(modelGroup.serving.queueNo)}
                          class="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-semibold hover:bg-green-700 transition-colors"
                        >
                          Done & Move Next
                        </button>
                      {:else if modelGroup.waitingCount > 0}
                        <button 
                          on:click={() => callNextForModel(modelGroup.model)}
                          class="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Call Next
                        </button>
                      {/if}
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
{/if}
