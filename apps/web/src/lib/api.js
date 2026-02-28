// Use environment variable or default to localhost for development
const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8080';

export async function register(data) {
  const response = await fetch(`${API_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  
  if (!response.ok) {
    // Return the full error response instead of throwing
    return {
      success: false,
      error: result.error || 'Registration failed',
      message: result.message,
      details: result.details
    };
  }

  return result;
}

export async function getQueue(branch = 'MAIN') {
  const response = await fetch(`${API_URL}/api/queue?branch=${branch}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch queue');
  }

  return response.json();
}

export async function verifyStaffPin(pin) {
  const response = await fetch(`${API_URL}/api/staff/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Authentication failed');
  }

  return response.json();
}

export async function getStaffTickets(pin, branch) {
  const response = await fetch(`${API_URL}/api/staff/tickets?branch=${branch}`, {
    headers: { 'x-staff-pin': pin }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch tickets');
  }

  return response.json();
}

export async function callNext(pin, branch) {
  const response = await fetch(`${API_URL}/api/staff/next`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-staff-pin': pin
    },
    body: JSON.stringify({ branch })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to call next');
  }

  return response.json();
}

export async function callSpecific(pin, branch, queueNo) {
  const response = await fetch(`${API_URL}/api/staff/call`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-staff-pin': pin
    },
    body: JSON.stringify({ branch, queueNo })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to call ticket');
  }

  return response.json();
}

export async function markDone(pin, branch, queueNo) {
  const response = await fetch(`${API_URL}/api/staff/mark-done`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-staff-pin': pin
    },
    body: JSON.stringify({ branch, queueNo })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to mark as done');
  }

  return response.json();
}

export async function markNoShow(pin, branch, queueNo) {
  const response = await fetch(`${API_URL}/api/staff/no-show`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-staff-pin': pin
    },
    body: JSON.stringify({ branch, queueNo })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to mark as no-show');
  }

  return response.json();
}

export async function getCars(branch) {
  const response = await fetch(`${API_URL}/api/cars?branch=${branch}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch cars');
  }

  return response.json();
}

// Car Management API Functions

export async function getStaffCars(pin, branch, includeInactive = false) {
  const url = `${API_URL}/api/staff/cars?branch=${branch}${includeInactive ? '&includeInactive=true' : ''}`;
  const response = await fetch(url, {
    headers: { 'x-staff-pin': pin }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch cars');
  }

  return response.json();
}

export async function createCar(pin, data) {
  const response = await fetch(`${API_URL}/api/staff/cars`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-staff-pin': pin
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create car');
  }

  return response.json();
}

export async function updateCar(pin, carId, data) {
  const response = await fetch(`${API_URL}/api/staff/cars/${carId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-staff-pin': pin
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update car');
  }

  return response.json();
}

export async function toggleCarActive(pin, carId) {
  const response = await fetch(`${API_URL}/api/staff/cars/${carId}/toggle`, {
    method: 'PATCH',
    headers: {
      'x-staff-pin': pin
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to toggle car status');
  }

  return response.json();
}

export async function deleteCar(pin, carId) {
  const response = await fetch(`${API_URL}/api/staff/cars/${carId}`, {
    method: 'DELETE',
    headers: {
      'x-staff-pin': pin
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete car');
  }

  return response.json();
}

// Search registrations by name or queue number
export async function searchRegistrations(query, branch = 'MAIN') {
  const response = await fetch(`${API_URL}/api/registrations/search?query=${encodeURIComponent(query)}&branch=${branch}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to search registrations');
  }

  return response.json();
}

// Update registration
export async function updateRegistration(registrationId, data) {
  console.log('API: Updating registration', registrationId, data);
  
  const response = await fetch(`${API_URL}/api/registrations/${registrationId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  console.log('API: Update response', result);

  if (!response.ok) {
    throw new Error(result.message || result.error || 'Failed to update registration');
  }

  return result;
}
