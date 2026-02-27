import { getDatabase } from '../../config/firebase.js';

class Car {
  constructor(data) {
    this.branch = data.branch.toUpperCase();
    this.model = data.model;
    this.capacity = data.capacity || 1;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.displayOrder = data.displayOrder || 1;
    this.imageUrl = data.imageUrl || null;
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
  }

  static getRef() {
    return getDatabase().ref('cars');
  }

  static async create(data) {
    const car = new Car(data);
    
    // Check if model already exists for this branch
    const exists = await this.modelExists(car.branch, car.model);
    if (exists) {
      throw new Error(`Car model "${car.model}" already exists for branch ${car.branch}`);
    }
    
    const ref = this.getRef().push();
    await ref.set(car);
    return { id: ref.key, ...car };
  }

  static async findById(id) {
    const snapshot = await this.getRef().child(id).once('value');
    if (!snapshot.exists()) return null;
    return { id: snapshot.key, ...snapshot.val() };
  }

  static async update(id, updates) {
    updates.updatedAt = Date.now();
    await this.getRef().child(id).update(updates);
    return this.findById(id);
  }

  static async delete(id) {
    await this.getRef().child(id).remove();
  }

  static async getActiveCars(branch) {
    const snapshot = await this.getRef()
      .orderByChild('branch')
      .equalTo(branch.toUpperCase())
      .once('value');
    
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.entries(data)
      .map(([id, car]) => ({ id, ...car }))
      .filter(car => car.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder || a.model.localeCompare(b.model));
  }

  static async getAllCars(branch) {
    const snapshot = await this.getRef()
      .orderByChild('branch')
      .equalTo(branch.toUpperCase())
      .once('value');
    
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.entries(data)
      .map(([id, car]) => ({ id, ...car }))
      .sort((a, b) => a.displayOrder - b.displayOrder || a.model.localeCompare(b.model));
  }

  static async modelExists(branch, model, excludeId = null) {
    const cars = await this.getAllCars(branch);
    return cars.some(car => 
      car.model.trim() === model.trim() && 
      (!excludeId || car.id !== excludeId)
    );
  }

  static async toggleActive(id) {
    const car = await this.findById(id);
    if (!car) throw new Error('Car not found');
    
    return this.update(id, { isActive: !car.isActive });
  }
}

export default Car;
