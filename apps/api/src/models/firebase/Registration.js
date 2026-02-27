import { getDatabase } from '../../config/firebase.js';

class Registration {
  constructor(data) {
    this.queueNo = data.queueNo;
    this.fullName = data.fullName;
    this.mobile = data.mobile;
    this.model = data.model;
    this.modelId = data.modelId || null;
    this.salesConsultant = data.salesConsultant || null;
    this.branch = data.branch.toUpperCase();
    this.purpose = data.purpose || 'TEST_DRIVE';
    this.status = data.status || 'WAITING';
    this.calledAt = data.calledAt || null;
    this.completedAt = data.completedAt || null;
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
  }

  static getRef() {
    return getDatabase().ref('registrations');
  }

  static async create(data) {
    const registration = new Registration(data);
    const ref = this.getRef().push();
    await ref.set(registration);
    return { id: ref.key, ...registration };
  }

  static async findById(id) {
    const snapshot = await this.getRef().child(id).once('value');
    if (!snapshot.exists()) return null;
    return { id: snapshot.key, ...snapshot.val() };
  }

  static async findByQueueNo(queueNo) {
    const snapshot = await this.getRef()
      .orderByChild('queueNo')
      .equalTo(queueNo)
      .once('value');
    
    if (!snapshot.exists()) return null;
    const data = snapshot.val();
    const id = Object.keys(data)[0];
    return { id, ...data[id] };
  }

  static async update(id, updates) {
    updates.updatedAt = Date.now();
    await this.getRef().child(id).update(updates);
    return this.findById(id);
  }

  static async delete(id) {
    await this.getRef().child(id).remove();
  }

  static async getQueueByBranch(branch, statuses = ['WAITING', 'SERVING']) {
    const snapshot = await this.getRef()
      .orderByChild('branch')
      .equalTo(branch.toUpperCase())
      .once('value');
    
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.entries(data)
      .map(([id, reg]) => ({ id, ...reg }))
      .filter(reg => statuses.includes(reg.status))
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  static async getTodayRegistrations(branch) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const snapshot = await this.getRef()
      .orderByChild('branch')
      .equalTo(branch.toUpperCase())
      .once('value');
    
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.entries(data)
      .map(([id, reg]) => ({ id, ...reg }))
      .filter(reg => reg.createdAt >= todayTimestamp)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  static async countByStatus(branch, status) {
    const registrations = await this.getTodayRegistrations(branch);
    return registrations.filter(reg => reg.status === status).length;
  }
}

export default Registration;
