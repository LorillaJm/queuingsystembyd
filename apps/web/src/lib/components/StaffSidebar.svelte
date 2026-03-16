<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { slide, fade } from 'svelte/transition';
  import { onMount } from 'svelte';
  
  export let authenticated = false;
  export let onLogout = () => {};
  
  let isOpen = false;
  let isPinned = false;
  
  onMount(() => {
    // Load pinned state from localStorage
    isPinned = localStorage.getItem('sidebarPinned') === 'true';
    // On desktop, open by default if pinned
    if (window.innerWidth >= 1024 && isPinned) {
      isOpen = true;
    }
  });
  
  $: currentPath = $page.url.pathname;
  $: sidebarWidth = isOpen ? (isPinned ? '280px' : '280px') : '0px';
  
  const navItems = [
    {
      path: '/staff',
      label: 'Staff Dashboard',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      description: 'Manage queue'
    },
    {
      path: '/summary',
      label: 'Summary Report',
      icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      description: 'View summary'
    },
    {
      path: '/mc',
      label: 'MC Display',
      icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      description: 'TV display'
    },
    {
      path: '/',
      label: 'Registration',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      description: 'Register customer'
    }
  ];
  
  function toggleSidebar() {
    isOpen = !isOpen;
  }
  
  function togglePin() {
    isPinned = !isPinned;
    localStorage.setItem('sidebarPinned', isPinned.toString());
    if (isPinned) {
      isOpen = true;
    }
  }
  
  function handleNavigation(path) {
    goto(path);
    // On mobile, close sidebar after navigation
    if (window.innerWidth < 1024 && !isPinned) {
      isOpen = false;
    }
  }
  
  function handleLogout() {
    onLogout();
    if (!isPinned) {
      isOpen = false;
    }
  }
  
  function closeSidebar() {
    if (!isPinned) {
      isOpen = false;
    }
  }
</script>

<!-- Menu Toggle Button (Fixed Position) -->
<button
  on:click={toggleSidebar}
  class="fixed top-4 left-4 z-50 p-2.5 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all"
  aria-label="Toggle menu"
  style="width: 44px; height: 44px;"
>
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {#if isOpen}
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
    {:else}
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
    {/if}
  </svg>
</button>

<!-- Overlay for mobile (only when not pinned) -->
{#if isOpen && !isPinned}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
    on:click={closeSidebar}
    transition:fade={{ duration: 200 }}
  ></div>
{/if}

<!-- Sidebar -->
<aside
  class="fixed top-0 left-0 h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl z-40 transition-transform duration-300 ease-in-out overflow-hidden"
  class:-translate-x-full={!isOpen}
  class:translate-x-0={isOpen}
  style="width: 280px;"
>
  <div class="flex flex-col h-full w-full">
    <!-- Header -->
    <div class="p-4 border-b border-gray-700 flex-shrink-0">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
            </svg>
          </div>
          <div class="min-w-0">
            <h2 class="text-sm font-bold truncate">BYD Iloilo</h2>
            <p class="text-xs text-gray-400 truncate">Staff Portal</p>
          </div>
        </div>
        
        <!-- Pin Button -->
        <button
          on:click={togglePin}
          class="p-1.5 rounded-lg hover:bg-gray-700 transition-colors flex-shrink-0"
          title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
        >
          <svg class="w-4 h-4" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
          </svg>
        </button>
      </div>
      
      {#if authenticated}
        <div class="flex items-center gap-2 px-2 py-1.5 bg-green-900/30 border border-green-700 rounded-lg">
          <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></div>
          <span class="text-xs text-green-300 truncate">Authenticated</span>
        </div>
      {:else}
        <div class="flex items-center gap-2 px-2 py-1.5 bg-amber-900/30 border border-amber-700 rounded-lg">
          <div class="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0"></div>
          <span class="text-xs text-amber-300 truncate">Not Authenticated</span>
        </div>
      {/if}
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto p-3 space-y-1">
      {#each navItems as item}
        <button
          on:click={() => handleNavigation(item.path)}
          class="w-full group"
        >
          <div
            class="flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200"
            class:bg-blue-600={currentPath === item.path}
            class:shadow-lg={currentPath === item.path}
            class:hover:bg-gray-700={currentPath !== item.path}
          >
            <div class="flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon}/>
              </svg>
            </div>
            <div class="flex-1 text-left min-w-0">
              <div class="font-semibold text-sm truncate">{item.label}</div>
              <div class="text-xs text-gray-400 group-hover:text-gray-300 truncate">{item.description}</div>
            </div>
            {#if currentPath === item.path}
              <div class="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
            {/if}
          </div>
        </button>
      {/each}
    </nav>

    <!-- Footer -->
    <div class="p-3 border-t border-gray-700 space-y-2 flex-shrink-0">
      {#if authenticated}
        <button
          on:click={handleLogout}
          class="w-full flex items-center gap-2 px-3 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200"
        >
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span class="font-semibold text-sm">Logout</span>
        </button>
      {/if}
      
      <div class="text-xs text-gray-500 text-center px-2">
        <p>© 2024 BYD Iloilo</p>
      </div>
    </div>
  </div>
</aside>

<style>
  /* Smooth transitions */
  aside {
    will-change: transform;
  }
  
  /* Custom scrollbar for navigation */
  nav::-webkit-scrollbar {
    width: 4px;
  }
  
  nav::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 2px;
  }
  
  nav::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
  
  nav::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
</style>
