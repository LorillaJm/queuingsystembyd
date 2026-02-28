// Firebase client configuration for direct database access
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, get } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // Replace with your actual API key
  authDomain: "testdrive-17e53.firebaseapp.com",
  databaseURL: "https://testdrive-17e53-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "testdrive-17e53",
  storageBucket: "testdrive-17e53.appspot.com",
  messagingSenderId: "XXXXXXXXXXXX",
  appId: "1:XXXXXXXXXXXX:web:XXXXXXXXXXXXXXXXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

/**
 * Fetch cars from Firebase Realtime Database
 * @param {string} branch - Branch code (e.g., 'MAIN')
 * @returns {Promise<Array>} Array of car objects
 */
export async function fetchCarsFromFirebase(branch = 'MAIN') {
  try {
    const carsRef = ref(database, 'cars');
    const snapshot = await get(carsRef);
    
    if (!snapshot.exists()) {
      return [];
    }

    const carsData = snapshot.val();
    const cars = [];

    // Convert Firebase object to array and filter by branch
    Object.keys(carsData).forEach(key => {
      const car = carsData[key];
      if (car.branch === branch.toUpperCase() && car.isActive) {
        cars.push({
          carId: key,
          model: car.model,
          capacity: car.capacity,
          displayOrder: car.displayOrder || 0,
          imageUrl: car.imageUrl || null
        });
      }
    });

    // Sort by displayOrder
    cars.sort((a, b) => a.displayOrder - b.displayOrder);

    return cars;
  } catch (error) {
    console.error('Error fetching cars from Firebase:', error);
    throw error;
  }
}

/**
 * Listen to real-time car updates
 * @param {string} branch - Branch code
 * @param {Function} callback - Callback function to receive updates
 * @returns {Function} Unsubscribe function
 */
export function listenToCars(branch = 'MAIN', callback) {
  const carsRef = ref(database, 'cars');
  
  const unsubscribe = onValue(carsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const carsData = snapshot.val();
    const cars = [];

    Object.keys(carsData).forEach(key => {
      const car = carsData[key];
      if (car.branch === branch.toUpperCase() && car.isActive) {
        cars.push({
          carId: key,
          model: car.model,
          capacity: car.capacity,
          displayOrder: car.displayOrder || 0,
          imageUrl: car.imageUrl || null
        });
      }
    });

    cars.sort((a, b) => a.displayOrder - b.displayOrder);
    callback(cars);
  });

  return unsubscribe;
}

export { database };
