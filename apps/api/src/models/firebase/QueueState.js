import { getDatabase } from '../../config/firebase.js';

class QueueState {
  constructor(data) {
    this.branch = data.branch.toUpperCase();
    this.dateKey = data.dateKey;
    this.lastNumber = data.lastNumber || 0;
    this.currentServingQueueNo = data.currentServingQueueNo || null;
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
  }

  static getRef() {
    return getDatabase().ref('queueStates');
  }

  static getStateKey(branch, dateKey) {
    return `${branch.toUpperCase()}_${dateKey}`;
  }

  static async getOrCreateTodayState(branch) {
    const dateKey = new Date().toISOString().split('T')[0];
    const stateKey = this.getStateKey(branch, dateKey);
    
    const snapshot = await this.getRef().child(stateKey).once('value');
    
    if (snapshot.exists()) {
      return { id: stateKey, ...snapshot.val() };
    }
    
    // Create new state
    const state = new QueueState({
      branch: branch.toUpperCase(),
      dateKey,
      lastNumber: 0,
      currentServingQueueNo: null
    });
    
    await this.getRef().child(stateKey).set(state);
    return { id: stateKey, ...state };
  }

  static async getNextNumber(branch) {
    const dateKey = new Date().toISOString().split('T')[0];
    const stateKey = this.getStateKey(branch, dateKey);
    
    // Use transaction for atomic increment
    const ref = this.getRef().child(stateKey);
    
    return new Promise((resolve, reject) => {
      ref.transaction((current) => {
        if (current === null) {
          // Create new state
          return {
            branch: branch.toUpperCase(),
            dateKey,
            lastNumber: 1,
            currentServingQueueNo: null,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
        }
        
        // Increment lastNumber
        current.lastNumber = (current.lastNumber || 0) + 1;
        current.updatedAt = Date.now();
        return current;
      }, (error, committed, snapshot) => {
        if (error) {
          reject(error);
        } else if (!committed) {
          reject(new Error('Transaction not committed'));
        } else {
          resolve(snapshot.val().lastNumber);
        }
      });
    });
  }

  static async updateCurrentServing(branch, queueNo) {
    const dateKey = new Date().toISOString().split('T')[0];
    const stateKey = this.getStateKey(branch, dateKey);
    
    await this.getRef().child(stateKey).update({
      currentServingQueueNo: queueNo,
      updatedAt: Date.now()
    });
    
    const snapshot = await this.getRef().child(stateKey).once('value');
    return { id: stateKey, ...snapshot.val() };
  }

  static async getCurrentServing(branch) {
    const dateKey = new Date().toISOString().split('T')[0];
    const stateKey = this.getStateKey(branch, dateKey);
    
    const snapshot = await this.getRef().child(stateKey).once('value');
    
    if (!snapshot.exists()) return null;
    
    return snapshot.val().currentServingQueueNo || null;
  }
}

export default QueueState;
