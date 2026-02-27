<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { getSocket } from '$lib/socket';
  import { getCars } from '$lib/api';
  import { fade } from 'svelte/transition';

  let socket, authenticated = false, pin = '', error = '', loading = false;
  let branch = 'MAIN', cars = [], tickets = [], lastUpdate = new Date();

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
        fetchTickets();
      } else {
        alert(data.message || 'Failed to call next customer');
      }
    } catch (err) {
      alert('Failed to call next customer');
    }
  }

  async function markAsDone(queueNo) {
    if (!confirm('Mark this customer as done?')) return;
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
        fetchTickets();
      } else {
        alert(data.message || 'Failed to mark as done');
      }
    } catch (err) {
      alert('Failed to mark as done');
    }
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
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-rose-600 to-red-700">
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
      <div class="text-center mb-6">
        <div class="text-4xl mb-3">🏮</div>
        <h1 class="text-2xl font-bold text-slate-900">Staff Login</h1>
        <p class="text-sm text-slate-500 mt-1">Enter your PIN to continue</p>
      </div>
      <form on:submit={handleLogin} class="space-y-4">
        <input 
          type="password" 
          bind:value={pin} 
          placeholder="Enter PIN" 
          class="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-center text-lg tracking-widest focus:outline-none focus:border-red-500 transition-colors"
          required 
        />
        {#if error}
          <p class="text-red-600 text-sm text-center">{error}</p>
        {/if}
        <button 
          type="submit" 
          class="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  </div>
{:else}
  <!-- Staff Panel -->
  <div class="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- Compact Header -->
    <header class="bg-white/80 backdrop-blur-xl border-b border-slate-200 flex-shrink-0">
      <div class="px-4 py-2 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="bg-gradient-to-r from-red-600 to-rose-600 text-white px-3 py-1 rounded-lg font-semibold text-xs">
            {branch}
          </div>
          <h1 class="text-lg font-bold text-slate-900">Staff Control</h1>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-xs text-slate-500">{lastUpdate.toLocaleTimeString()}</div>
          <button 
            on:click={handleLogout}
            class="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Event Banner -->
    <div class="flex-shrink-0 bg-gradient-to-r from-red-700 via-red-600 to-red-700 border-b-2 border-yellow-400">
      <div class="px-4 py-2 flex items-center justify-center gap-2">
        <span class="text-yellow-300 text-lg">🏮</span>
        <span class="text-white font-bold text-sm">PROSPERITY IN MOTION</span>
        <span class="text-yellow-200 text-xs">• Feb 28, 2026</span>
        <span class="text-yellow-300 text-lg">🏮</span>
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto p-4">
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead class="bg-gradient-to-r from-slate-50 to-slate-100 sticky top-0">
              <tr class="border-b-2 border-slate-200">
                <th class="px-3 py-2 text-left text-xs font-bold text-slate-700 uppercase tracking-wide">Model</th>
                <th class="px-3 py-2 text-left text-xs font-bold text-slate-700 uppercase tracking-wide">Serving</th>
                <th class="px-3 py-2 text-center text-xs font-bold text-slate-700 uppercase tracking-wide">Waiting</th>
                <th class="px-3 py-2 text-center text-xs font-bold text-slate-700 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each ticketsByModel as modelGroup (modelGroup.model)}
                <tr in:fade={{ duration: 300 }} class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <!-- Model -->
                  <td class="px-3 py-3 align-middle">
                    <div class="font-semibold text-sm text-slate-900 leading-tight">
                      {modelGroup.model}
                    </div>
                  </td>
                  
                  <!-- Currently Serving -->
                  <td class="px-3 py-3 align-middle">
                    {#if modelGroup.serving}
                      <div class="flex items-center gap-2">
                        <div class="bg-gradient-to-br from-red-500 to-rose-600 text-white px-2 py-1 rounded-lg font-bold text-sm min-w-[60px] text-center">
                          {modelGroup.serving.queueNo}
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="font-semibold text-sm text-slate-900 truncate">{modelGroup.serving.fullName}</div>
                          <div class="text-xs text-slate-500 truncate">{modelGroup.serving.mobile}</div>
                        </div>
                      </div>
                    {:else}
                      <span class="text-slate-400 text-sm italic">No customer</span>
                    {/if}
                  </td>
                  
                  <!-- Waiting Count -->
                  <td class="px-3 py-3 align-middle text-center">
                    <span class="inline-flex items-center px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold">
                      {modelGroup.waitingCount}
                    </span>
                  </td>
                  
                  <!-- Actions -->
                  <td class="px-3 py-3 align-middle">
                    <div class="flex items-center justify-center gap-2">
                      {#if modelGroup.serving}
                        <button 
                          on:click={() => markAsDone(modelGroup.serving.queueNo)}
                          class="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors"
                        >
                          Done
                        </button>
                      {/if}
                      {#if modelGroup.waitingCount > 0}
                        <button 
                          on:click={() => callNextForModel(modelGroup.model)}
                          class="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
                        >
                          Next
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
