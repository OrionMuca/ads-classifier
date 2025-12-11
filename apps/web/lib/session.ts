/**
 * Session management utility for anonymous user tracking
 * Generates and manages session IDs for tracking user behavior
 */

const SESSION_ID_KEY = 'session_id';
const SESSION_STORAGE_KEY = 'session_storage';

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * Get or create a session ID
 * Uses sessionStorage for tab-scoped sessions, falls back to localStorage for persistence
 */
export function getSessionId(): string {
    if (typeof window === 'undefined') {
        return '';
    }

    try {
        // Try sessionStorage first (clears on tab close)
        let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
        
        if (!sessionId) {
            // Generate new session ID
            sessionId = generateUUID();
            sessionStorage.setItem(SESSION_ID_KEY, sessionId);
            
            // Also store in localStorage as backup for cross-tab persistence
            localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
        } else {
            // Sync to localStorage as backup
            localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
        }
        
        return sessionId;
    } catch (error) {
        // Handle quota exceeded or other storage errors
        console.warn('Failed to access sessionStorage, using localStorage fallback:', error);
        
        try {
            let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
            if (!sessionId) {
                sessionId = generateUUID();
                localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
            }
            return sessionId;
        } catch (fallbackError) {
            console.error('Failed to access localStorage:', fallbackError);
            // Return a temporary session ID that won't persist
            return generateUUID();
        }
    }
}

/**
 * Clear session ID (useful for logout or testing)
 */
export function clearSessionId(): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        sessionStorage.removeItem(SESSION_ID_KEY);
        localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
        console.warn('Failed to clear session ID:', error);
    }
}

/**
 * Migrate session data to user account (called on login)
 * This allows anonymous search history to be associated with the user
 */
export function migrateSessionToUser(userId: string): void {
    // Store the session ID with the user ID for backend migration
    if (typeof window !== 'undefined') {
        const sessionId = getSessionId();
        if (sessionId) {
            localStorage.setItem(`session_migration_${userId}`, sessionId);
        }
    }
}

/**
 * Get session ID for migration (used when user logs in)
 */
export function getSessionIdForMigration(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        return sessionStorage.getItem(SESSION_ID_KEY) || localStorage.getItem(SESSION_STORAGE_KEY);
    } catch (error) {
        console.warn('Failed to get session ID for migration:', error);
        return null;
    }
}


