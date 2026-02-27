<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  let authenticated = false;
  let pin = '';
  let error = '';
  let loading = false;
  let branch = 'MAIN';
  let tickets = [];
  let lastUpdate = new Date();
  let successMessage = '';
  let entriesPerPage = 10; // Default to 10 entries
  let searchQuery = '';

  $: activeTickets = tickets.filter(t => t.status !== 'DONE' && t.status !== 'NOSHOW');
  $: filteredTickets = searchQuery.trim() 
    ? activeTickets.filter(t => 
        t.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.queueNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.mobile?.includes(searchQuery) ||
        t.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.idNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeTickets;
  $: displayedTickets = entriesPerPage === 'all' ? filteredTickets : filteredTickets.slice(0, parseInt(entriesPerPage));

  const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001';
  const SUMMARY_PIN = '9999'; // Secret PIN for summary page

  async function handleLogin(e) {
    e.preventDefault();
    loading = true;
    error = '';
    
    if (pin === SUMMARY_PIN) {
      authenticated = true;
      localStorage.setItem('summaryPin', pin);
      fetchTickets();
    } else {
      error = 'Invalid PIN';
    }
    
    loading = false;
  }

  async function fetchTickets() {
    try {
      const response = await fetch(`${API_URL}/api/registrations?branch=${branch}&includeAll=true`);
      const data = await response.json();
      if (data.success) {
        tickets = data.data.registrations || [];
        lastUpdate = new Date();
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    }
  }

  function downloadExcel() {
    const activeTickets = tickets.filter(t => t.status !== 'DONE' && t.status !== 'NOSHOW');
    
    if (activeTickets.length === 0) {
      alert('No customers to export');
      return;
    }

    const headers = ['Queue #', 'Full Name', 'ID Number', 'Email', 'Mobile', 'Vehicle Model', 'SC', 'Test Drive', 'Reservation', 'Remarks'];
    const csvRows = [headers.join(',')];
    
    activeTickets.forEach(ticket => {
      const row = [
        ticket.queueNo || '',
        `"${ticket.fullName || ''}"`,
        ticket.idNumber || '',
        ticket.email || '',
        ticket.mobile || '',
        ticket.model || '',
        `"${ticket.salesConsultant || ''}"`,
        ticket.purpose && ticket.purpose.includes('TEST_DRIVE') ? 'Yes' : 'No',
        ticket.purpose && ticket.purpose.includes('RESERVATION') ? (ticket.paymentMode || 'Reserved') : 'No',
        ''
      ];
      csvRows.push(row.join(','));
    });

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

  function showSuccess(message) {
    successMessage = message;
    setTimeout(() => {
      successMessage = '';
    }, 3000);
  }

  function handleLogout() {
    authenticated = false;
    localStorage.removeItem('summaryPin');
    pin = '';
  }

  function handleRefresh() {
    fetchTickets();
    showSuccess('Data refreshed!');
  }

  onMount(() => {
    const storedPin = localStorage.getItem('summaryPin');
    if (storedPin === SUMMARY_PIN) {
      pin = storedPin;
      authenticated = true;
      fetchTickets();
    }
    
    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  });
</script>

<svelte:head><title>Customer Summary - {branch}</title></svelte:head>

{#if !authenticated}
  <!-- Login Screen -->
  <div class="min-h-screen flex items-center justify-center bg-white">
    <div class="bg-white rounded-2xl border border-gray-200 p-10 w-full max-w-md mx-4">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-semibold text-gray-900 mb-2">Customer Summary</h1>
        <p class="text-base text-gray-500">Enter PIN to access</p>
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
          {loading ? 'Verifying...' : 'Access Summary'}
        </button>
      </form>
    </div>
  </div>
{:else}
  <!-- Summary Page -->
  <div class="min-h-screen bg-white">
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
    <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="bg-gray-100 text-gray-900 px-4 py-2 rounded-full font-semibold text-sm">
            {branch}
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Customer Summary</h1>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-sm text-gray-500">{lastUpdate.toLocaleTimeString()}</div>
          <button 
            on:click={handleRefresh}
            class="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Refresh
          </button>
          <button 
            on:click={downloadExcel}
            class="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Download Excel
          </button>
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
    <main class="p-6">
      <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <!-- Search and Entries Filter -->
        <div class="px-6 py-4 border-b border-gray-200 space-y-4">
          <!-- Search Bar -->
          <div class="flex items-center gap-3">
            <div class="flex-1 relative">
              <input
                type="text"
                bind:value={searchQuery}
                placeholder="Search by name, queue #, mobile, email, or ID number..."
                class="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              {#if searchQuery}
                <button
                  on:click={() => searchQuery = ''}
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              {/if}
            </div>
          </div>
          
          <!-- Entries Filter -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <label class="text-sm text-gray-600">Show</label>
              <select 
                bind:value={entriesPerPage}
                class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="all">All</option>
              </select>
              <label class="text-sm text-gray-600">entries</label>
            </div>
            <div class="text-sm text-gray-600">
              Showing {displayedTickets.length} of {filteredTickets.length} {searchQuery ? 'filtered' : ''} customers
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead class="bg-gray-50 sticky top-0">
              <tr class="border-b border-gray-200">
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Queue #</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Full Name</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">ID Number</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Email</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Mobile</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Vehicle Model</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">SC</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Test Drive</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Reservation</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {#each displayedTickets as ticket (ticket.ticketId)}
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
                  
                  <!-- ID Number -->
                  <td class="px-4 py-3 align-middle">
                    <div class="text-gray-600 text-xs font-mono">{ticket.idNumber || 'N/A'}</div>
                  </td>
                  
                  <!-- Email -->
                  <td class="px-4 py-3 align-middle">
                    <div class="text-gray-600 text-xs">{ticket.email || 'N/A'}</div>
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
                      <span class="text-gray-400 text-xs">No</span>
                    {/if}
                  </td>
                  
                  <!-- Reservation -->
                  <td class="px-4 py-3 align-middle">
                    {#if ticket.purpose && ticket.purpose.includes('RESERVATION')}
                      {#if ticket.paymentMode}
                        <span class="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">
                          {ticket.paymentMode}
                        </span>
                      {:else}
                        <span class="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">
                          Reserved
                        </span>
                      {/if}
                    {:else}
                      <span class="text-gray-400 text-xs">N/A</span>
                    {/if}
                  </td>
                  
                  <!-- Remarks -->
                  <td class="px-4 py-3 align-middle">
                    <div class="text-gray-600 text-xs">{ticket.remarks || ''}</div>
                  </td>
                </tr>
              {/each}
              
              {#if displayedTickets.length === 0}
                <tr>
                  <td colspan="10" class="px-4 py-8 text-center text-gray-500">
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
