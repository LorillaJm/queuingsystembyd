import { getDatabase } from '../../config/firebase.js';

class Settings {
  static getRef() {
    return getDatabase().ref('settings/app_settings');
  }

  static async getSettings() {
    const snapshot = await this.getRef().once('value');
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    
    // Create default settings
    const defaultSettings = {
      staffPin: process.env.STAFF_PIN || '1234',
      allowedBranches: [
        { code: 'MAIN', name: 'Main Branch', prefix: 'A', active: true },
        { code: 'NORTH', name: 'North Branch', prefix: 'B', active: true },
        { code: 'SOUTH', name: 'South Branch', prefix: 'C', active: true }
      ],
      purposes: ['TEST_DRIVE', 'SERVICE', 'INQUIRY', 'PURCHASE'],
      dailyResetTime: '00:00',
      maxQueuePerDay: 999,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    await this.getRef().set(defaultSettings);
    return defaultSettings;
  }

  static async updateSettings(updates) {
    updates.updatedAt = Date.now();
    await this.getRef().update(updates);
    return this.getSettings();
  }

  static async verifyPin(pin) {
    const settings = await this.getSettings();
    return settings.staffPin === pin;
  }

  static async getBranch(branchCode) {
    const settings = await this.getSettings();
    return settings.allowedBranches.find(
      b => b.code === branchCode.toUpperCase() && b.active
    );
  }

  static async getActiveBranches() {
    const settings = await this.getSettings();
    return settings.allowedBranches.filter(b => b.active);
  }

  static async isBranchValid(branchCode) {
    const branch = await this.getBranch(branchCode);
    return !!branch;
  }
}

export default Settings;
