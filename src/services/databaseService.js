// MediFlow Database Service - SQLite (Local Storage)
// Implements the database schema from the roadmap

import * as SQLite from 'expo-sqlite';

class DatabaseService {
    constructor() {
        this.db = null;
    }

    // Initialize database and create tables
    async init() {
        try {
            this.db = await SQLite.openDatabaseAsync('mediflow.db');
            await this.createTables();
            console.log('✅ Database initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Database initialization error:', error);
            throw error;
        }
    }

    // Create all tables based on roadmap schema
    async createTables() {
        // Users table
        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        name TEXT,
        avatar_url TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now')),
        settings TEXT,
        is_premium INTEGER DEFAULT 0,
        premium_expires_at INTEGER,
        onboarding_completed INTEGER DEFAULT 0,
        timezone TEXT DEFAULT 'UTC'
      );
    `);

        // Medicines table
        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS medicines (
        med_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        
        -- Scanned/Verified Data
        verified_name TEXT NOT NULL,
        generic_name TEXT,
        brand_name TEXT,
        manufacturer TEXT,
        
        -- Classification
        category TEXT,
        form TEXT,
        strength TEXT,
        active_ingredients TEXT,
        
        -- User Data
        custom_name TEXT,
        notes TEXT,
        color TEXT,
        expiry_date INTEGER,
        image_url TEXT,
        
        -- Metadata
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now')),
        is_active INTEGER DEFAULT 1,
        
        -- API Reference
        api_source TEXT DEFAULT 'manual',
        api_id TEXT,
        
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );
    `);

        // Reminders table
        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS reminders (
        reminder_id TEXT PRIMARY KEY,
        med_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        
        -- Time Configuration
        time TEXT NOT NULL,
        days TEXT NOT NULL,
        
        -- Frequency
        frequency_type TEXT DEFAULT 'daily',
        interval_days INTEGER,
        
        -- Duration
        start_date INTEGER NOT NULL,
        end_date INTEGER,
        
        -- Settings
        is_active INTEGER DEFAULT 1,
        notification_enabled INTEGER DEFAULT 1,
        sound TEXT DEFAULT 'default',
        snooze_enabled INTEGER DEFAULT 1,
        
        -- Metadata
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now')),
        last_triggered INTEGER,
        next_trigger INTEGER,
        
        FOREIGN KEY (med_id) REFERENCES medicines(med_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );
    `);

        // History table
        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS history (
        entry_id TEXT PRIMARY KEY,
        reminder_id TEXT,
        med_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        
        -- Event Details
        scheduled_time INTEGER NOT NULL,
        actual_time INTEGER,
        status TEXT NOT NULL,
        
        -- Additional Context
        notes TEXT,
        late_by_minutes INTEGER,
        
        -- Metadata
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        synced INTEGER DEFAULT 0,
        
        FOREIGN KEY (reminder_id) REFERENCES reminders(reminder_id) ON DELETE SET NULL,
        FOREIGN KEY (med_id) REFERENCES medicines(med_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );
    `);

        // Create indexes for better performance
        await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_medicines_user ON medicines(user_id);
      CREATE INDEX IF NOT EXISTS idx_medicines_active ON medicines(user_id, is_active);
      CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);
      CREATE INDEX IF NOT EXISTS idx_reminders_active ON reminders(user_id, is_active);
      CREATE INDEX IF NOT EXISTS idx_reminders_next ON reminders(next_trigger);
      CREATE INDEX IF NOT EXISTS idx_history_user ON history(user_id);
      CREATE INDEX IF NOT EXISTS idx_history_medicine ON history(med_id);
      CREATE INDEX IF NOT EXISTS idx_history_date ON history(scheduled_time);
    `);

        console.log('✅ All tables created successfully');
    }

    // ==================== MEDICINE OPERATIONS ====================

    async saveMedicine(medicine) {
        const medId = medicine.med_id || `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        await this.db.runAsync(
            `INSERT INTO medicines (
        med_id, user_id, verified_name, generic_name, brand_name, 
        manufacturer, category, form, strength, active_ingredients,
        custom_name, notes, color, expiry_date, image_url, api_source, api_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                medId,
                medicine.user_id,
                medicine.verified_name,
                medicine.generic_name || null,
                medicine.brand_name || null,
                medicine.manufacturer || null,
                medicine.category || null,
                medicine.form || null,
                medicine.strength || null,
                medicine.active_ingredients ? JSON.stringify(medicine.active_ingredients) : null,
                medicine.custom_name || null,
                medicine.notes || null,
                medicine.color || null,
                medicine.expiry_date || null,
                medicine.image_url || null,
                medicine.api_source || 'manual',
                medicine.api_id || null,
            ]
        );

        return medId;
    }

    async getMedicines(userId) {
        const result = await this.db.getAllAsync(
            'SELECT * FROM medicines WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC',
            [userId]
        );
        return result.map(m => ({
            ...m,
            is_active: Boolean(m.is_active),
            active_ingredients: m.active_ingredients ? JSON.parse(m.active_ingredients) : [],
        }));
    }

    async getMedicineById(medId) {
        const result = await this.db.getFirstAsync(
            'SELECT * FROM medicines WHERE med_id = ?',
            [medId]
        );
        if (result) {
            result.is_active = Boolean(result.is_active);
        }
        return result;
    }

    async updateMedicine(medId, updates) {
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(updates), Date.now(), medId];

        await this.db.runAsync(
            `UPDATE medicines SET ${fields}, updated_at = ? WHERE med_id = ?`,
            values
        );
    }

    async deleteMedicine(medId) {
        await this.db.runAsync(
            'UPDATE medicines SET is_active = 0 WHERE med_id = ?',
            [medId]
        );
    }

    async searchMedicines(userId, searchTerm) {
        const result = await this.db.getAllAsync(
            `SELECT * FROM medicines 
       WHERE user_id = ? AND is_active = 1 
       AND (verified_name LIKE ? OR brand_name LIKE ? OR generic_name LIKE ?)
       ORDER BY created_at DESC`,
            [userId, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
        );
        return result;
    }

    // ==================== REMINDER OPERATIONS ====================

    async saveReminder(reminder) {
        const reminderId = reminder.reminder_id || `rem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        await this.db.runAsync(
            `INSERT INTO reminders (
        reminder_id, med_id, user_id, time, days, frequency_type,
        interval_days, start_date, end_date, notification_enabled,
        sound, snooze_enabled
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                reminderId,
                reminder.med_id,
                reminder.user_id,
                reminder.time,
                JSON.stringify(reminder.days),
                reminder.frequency_type || 'daily',
                reminder.interval_days || null,
                reminder.start_date || Date.now(),
                reminder.end_date || null,
                reminder.notification_enabled !== false ? 1 : 0,
                reminder.sound || 'default',
                reminder.snooze_enabled !== false ? 1 : 0,
            ]
        );

        return reminderId;
    }

    async getReminders(userId) {
        const result = await this.db.getAllAsync(
            'SELECT * FROM reminders WHERE user_id = ? AND is_active = 1 ORDER BY time ASC',
            [userId]
        );
        return result.map(r => ({
            ...r,
            days: JSON.parse(r.days),
            is_active: Boolean(r.is_active),
            notification_enabled: Boolean(r.notification_enabled),
            snooze_enabled: Boolean(r.snooze_enabled),
        }));
    }

    async getRemindersByMedicine(medId) {
        const result = await this.db.getAllAsync(
            'SELECT * FROM reminders WHERE med_id = ? AND is_active = 1 ORDER BY time ASC',
            [medId]
        );
        return result.map(r => ({
            ...r,
            days: JSON.parse(r.days),
            is_active: Boolean(r.is_active),
            notification_enabled: Boolean(r.notification_enabled),
            snooze_enabled: Boolean(r.snooze_enabled),
        }));
    }

    async updateReminder(reminderId, updates) {
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(updates), Date.now(), reminderId];

        await this.db.runAsync(
            `UPDATE reminders SET ${fields}, updated_at = ? WHERE reminder_id = ?`,
            values
        );
    }

    async deleteReminder(reminderId) {
        await this.db.runAsync(
            'UPDATE reminders SET is_active = 0 WHERE reminder_id = ?',
            [reminderId]
        );
    }

    // ==================== HISTORY OPERATIONS ====================

    async logHistory(entry) {
        const entryId = entry.entry_id || `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        await this.db.runAsync(
            `INSERT INTO history (
        entry_id, reminder_id, med_id, user_id, scheduled_time,
        actual_time, status, notes, late_by_minutes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                entryId,
                entry.reminder_id || null,
                entry.med_id,
                entry.user_id,
                entry.scheduled_time,
                entry.actual_time || Date.now(),
                entry.status,
                entry.notes || null,
                entry.late_by_minutes || 0,
            ]
        );

        return entryId;
    }

    async getHistory(userId, limit = 50) {
        const result = await this.db.getAllAsync(
            `SELECT h.*, m.verified_name as medicine_name 
       FROM history h
       JOIN medicines m ON h.med_id = m.med_id
       WHERE h.user_id = ?
       ORDER BY h.scheduled_time DESC
       LIMIT ?`,
            [userId, limit]
        );
        return result;
    }

    async getHistoryByMedicine(medId, limit = 30) {
        const result = await this.db.getAllAsync(
            'SELECT * FROM history WHERE med_id = ? ORDER BY scheduled_time DESC LIMIT ?',
            [medId, limit]
        );
        return result;
    }

    async getHistoryByDateRange(userId, startDate, endDate) {
        const result = await this.db.getAllAsync(
            `SELECT h.*, m.verified_name as medicine_name 
       FROM history h
       JOIN medicines m ON h.med_id = m.med_id
       WHERE h.user_id = ? AND h.scheduled_time BETWEEN ? AND ?
       ORDER BY h.scheduled_time DESC`,
            [userId, startDate, endDate]
        );
        return result;
    }

    // ==================== STATISTICS ====================

    async getAdherenceStats(userId, days = 30) {
        const startDate = Date.now() - (days * 24 * 60 * 60 * 1000);

        const result = await this.db.getFirstAsync(
            `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'taken' THEN 1 ELSE 0 END) as taken,
        SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) as skipped,
        SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END) as missed
       FROM history
       WHERE user_id = ? AND scheduled_time >= ?`,
            [userId, startDate]
        );

        return {
            total: result.total || 0,
            taken: result.taken || 0,
            skipped: result.skipped || 0,
            missed: result.missed || 0,
            adherenceRate: result.total > 0 ? ((result.taken / result.total) * 100).toFixed(1) : 0,
        };
    }

    // ==================== USER OPERATIONS ====================

    async createUser(user) {
        const userId = user.user_id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        await this.db.runAsync(
            `INSERT INTO users (user_id, email, name, settings) VALUES (?, ?, ?, ?)`,
            [userId, user.email || null, user.name || 'User', JSON.stringify(user.settings || {})]
        );

        return userId;
    }

    async getUser(userId) {
        const result = await this.db.getFirstAsync(
            'SELECT * FROM users WHERE user_id = ?',
            [userId]
        );
        if (result) {
            if (result.settings) {
                result.settings = JSON.parse(result.settings);
            }
            result.is_premium = Boolean(result.is_premium);
            result.onboarding_completed = Boolean(result.onboarding_completed);
        }
        return result;
    }

    async updateUser(userId, updates) {
        if (updates.settings) {
            updates.settings = JSON.stringify(updates.settings);
        }

        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(updates), Date.now(), userId];

        await this.db.runAsync(
            `UPDATE users SET ${fields}, updated_at = ? WHERE user_id = ?`,
            values
        );
    }
}

// Export singleton instance
const databaseService = new DatabaseService();
export default databaseService;
