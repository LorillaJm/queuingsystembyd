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

  function groupTicketsByModel(tickets, cars) {
    const grouped = {};
    cars.forEach(car => {
      grouped[car.model] = { model: car.model, serving: null, waitingCount: 0 };
    });
    tickets.forEach(ticket => {
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
        alert(data.message || data.error || 'Failed to mark as done');
      }
    } catch (err) {
      console.error('Mark done exception:', err);
      alert('Failed to mark as done');
    }
  }

  function showSuccess(message) {
    successMessage = message;
    setTimeout(() => {
      successMessage = '';
    }, 3000);
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

      <!-- Customer Summary Table -->
      <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 class="text-lg font-bold text-gray-900">Customer Summary</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead class="bg-gray-50 sticky top-0">
              <tr class="border-b border-gray-200">
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Queue #</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Full Name</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Mobile</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Vehicle Model</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">SC</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Test Drive</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Reservation</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {#each tickets.filter(t => t.status !== 'DONE' && t.status !== 'NOSHOW') as ticket (ticket.id)}
                <tr in:fade={{ duration: 200 }} class="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <!-- Queue Number -->
                  <td class="px-4 py-3 align-middle">
                    <span class="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 font-semibold text-xs">
                      {ticket.queueNo}
                    </span>
                  </td>
                  
                  <!-- Full Name -->
                  <td class="px-4 py-3 align-middle">
                    <div class="font-medium text-gray-900">{ticket.fullName}</div>
                  </td>
                  
                  <!-- Mobile -->
                  <td class="px-4 py-3 align-middle">
                    <div class="text-gray-600">{ticket.mobile || 'N/A'}</div>
                  </td>
                  
                  <!-- Vehicle Model -->
                  <td class="px-4 py-3 align-middle">
                    <div class="text-gray-900">{ticket.model || 'N/A'}</div>
                  </td>
                  
                  <!-- Sales Consultant -->
                  <td class="px-4 py-3 align-middle">
                    <div class="text-gray-600 text-xs">{ticket.salesConsultant || 'N/A'}</div>
                  </td>
                  
                  <!-- Test Drive -->
                  <td class="px-4 py-3 align-middle">
                    {#if ticket.purpose && ticket.purpose.includes('TEST_DRIVE')}
                      <span class="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                        ✓ Yes
                      </span>
                    {:else}
                      <span class="text-gray-400 text-xs">N/A</span>
                    {/if}
                  </td>
                  
                  <!-- Reservation -->
                  <td class="px-4 py-3 align-middle">
                    {#if ticket.purpose && ticket.purpose.includes('RESERVATION')}
                      <span class="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">
                        ✓ Reserved
                      </span>
                    {:else}
                      <span class="text-gray-400 text-xs">N/A</span>
                    {/if}
                  </td>
                  
                  <!-- Remarks -->
                  <td class="px-4 py-3 align-middle">
                    <input 
                      type="text" 
                      placeholder="Add remarks..."
                      class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent"
                    />
                  </td>
                </tr>
              {/each}
              
              {#if tickets.filter(t => t.status !== 'DONE' && t.status !== 'NOSHOW').length === 0}
                <tr>
                  <td colspan="8" class="px-4 py-8 text-center text-gray-500">
                    No customers in queue
                  </td>
                </tr>
              {/if}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
{/if}
