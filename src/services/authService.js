// MediFlow Auth Service
// Local authentication with password hashing via expo-crypto

import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import databaseService from './databaseService';

const SESSION_KEY = 'mediflow_session_user_id';

class AuthService {

    // ==================== PASSWORD HASHING ====================

    async hashPassword(password) {
        // SHA-256 hash the password (for local storage only)
        const hash = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            password
        );
        return hash;
    }

    // ==================== VALIDATION ====================

    validateEmail(email) {
        if (!email || !email.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) return 'Please enter a valid email';
        return null;
    }

    validatePassword(password) {
        if (!password) return 'Password is required';
        if (password.length < 6) return 'Password must be at least 6 characters';
        return null;
    }

    validateName(name) {
        if (!name || !name.trim()) return 'Name is required';
        if (name.trim().length < 2) return 'Name must be at least 2 characters';
        return null;
    }

    // ==================== REGISTER ====================

    async register(name, email, password) {
        // Validate inputs
        const nameError = this.validateName(name);
        if (nameError) throw new Error(nameError);

        const emailError = this.validateEmail(email);
        if (emailError) throw new Error(emailError);

        const passwordError = this.validatePassword(password);
        if (passwordError) throw new Error(passwordError);

        const cleanEmail = email.trim().toLowerCase();

        // Check if email already exists
        const existingUser = await databaseService.getUserByEmail(cleanEmail);
        if (existingUser) {
            throw new Error('An account with this email already exists');
        }

        // Hash password
        const passwordHash = await this.hashPassword(password);

        // Create user
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        await databaseService.createUser({
            user_id: userId,
            name: name.trim(),
            email: cleanEmail,
            password_hash: passwordHash,
            settings: {
                theme: 'light',
                notifications: {
                    enabled: true,
                    sound: 'default',
                    vibration: true,
                    quiet_hours: { enabled: false, start: '22:00', end: '08:00' },
                },
                reminders: { snooze_enabled: true, snooze_duration: 15, persistent: true },
                privacy: { analytics: true, crash_reports: true },
            },
        });

        // Save session
        await this.saveSession(userId);

        // Return full user
        const user = await databaseService.getUser(userId);
        return user;
    }

    // ==================== LOGIN ====================

    async login(email, password) {
        const cleanEmail = email.trim().toLowerCase();

        // Validate inputs
        const emailError = this.validateEmail(cleanEmail);
        if (emailError) throw new Error(emailError);

        if (!password) throw new Error('Password is required');

        // Find user by email
        const user = await databaseService.getUserByEmail(cleanEmail);
        if (!user) {
            throw new Error('No account found with this email');
        }

        // Verify password
        const passwordHash = await this.hashPassword(password);
        if (user.password_hash !== passwordHash) {
            throw new Error('Incorrect password');
        }

        // Save session
        await this.saveSession(user.user_id);

        return user;
    }

    // ==================== SESSION ====================

    async saveSession(userId) {
        await AsyncStorage.setItem(SESSION_KEY, userId);
    }

    async getSession() {
        try {
            const userId = await AsyncStorage.getItem(SESSION_KEY);
            return userId;
        } catch {
            return null;
        }
    }

    async clearSession() {
        await AsyncStorage.removeItem(SESSION_KEY);
    }

    // ==================== LOGOUT ====================

    async logout() {
        await this.clearSession();
    }
}

const authService = new AuthService();
export default authService;
