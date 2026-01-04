import { getContext } from "hono/context-storage";
import { setCookie, deleteCookie, getCookie } from 'hono/cookie';
import { HonoVarTypes } from "types";
import { sign, verify } from "hono/jwt";

interface RegisterModel {
    username: string;
    password: string;
    email: string;
}

interface User {
    id: string;
    username: string;
    email: string;
    name: string;
}

// Mock user database (in-memory)
const mockUsers: Map<string, { password: string; user: User }> = new Map([
    ['admin', {
        password: 'admin123',
        user: {
            id: '1',
            username: 'admin',
            email: 'admin@example.com',
            name: 'Admin User'
        }
    }],
    ['user@example.com', {
        password: 'password',
        user: {
            id: '2',
            username: 'user',
            email: 'user@example.com',
            name: 'Test User'
        }
    }]
]);

// CSRF token storage (in-memory, in production use Redis or similar)
const csrfTokens = new Map<string, { token: string; expires: number }>();

// Secret for JWT signing
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function generateCSRFToken(): string {
    return crypto.randomUUID();
}

function validateCSRFToken(sessionId: string, token: string): boolean {
    const stored = csrfTokens.get(sessionId);
    if (!stored) return false;
    if (stored.expires < Date.now()) {
        csrfTokens.delete(sessionId);
        return false;
    }
    return stored.token === token;
}

const register = async (registerModel: RegisterModel) => {
    // Check if user already exists
    if (mockUsers.has(registerModel.username) || mockUsers.has(registerModel.email)) {
        throw new Error('User already exists');
    }

    const newUser: User = {
        id: crypto.randomUUID(),
        username: registerModel.username,
        email: registerModel.email,
        name: registerModel.username
    };

    mockUsers.set(registerModel.username, {
        password: registerModel.password,
        user: newUser
    });

    mockUsers.set(registerModel.email, {
        password: registerModel.password,
        user: newUser
    });

    const context = getContext<HonoVarTypes>();
    const sessionId = crypto.randomUUID();
    const csrfToken = generateCSRFToken();
    
    // Store CSRF token (expires in 1 hour)
    csrfTokens.set(sessionId, {
        token: csrfToken,
        expires: Date.now() + 60 * 60 * 1000
    });

    // Create JWT token with user info
    const token = await sign({
        sub: newUser.id,
        username: newUser.username,
        email: newUser.email,
        sessionId,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 hours
    }, JWT_SECRET);

    // Set HTTP-only cookie
    setCookie(context, 'auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
        maxAge: 60 * 60 * 24 // 24 hours
    });

    return {
        success: true,
        user: newUser,
        csrfToken // Return CSRF token to client for subsequent requests
    };
};

const login = async (username: string, password: string) => {
    // Try to find user by username or email
    const userRecord = mockUsers.get(username);

    if (!userRecord) {
        throw new Error('Invalid credentials');
    }

    if (userRecord.password !== password) {
        throw new Error('Invalid credentials');
    }

    const context = getContext<HonoVarTypes>();
    const sessionId = crypto.randomUUID();
    const csrfToken = generateCSRFToken();
    
    // Store CSRF token (expires in 1 hour)
    csrfTokens.set(sessionId, {
        token: csrfToken,
        expires: Date.now() + 60 * 60 * 1000
    });

    // Create JWT token with user info
    const token = await sign({
        sub: userRecord.user.id,
        username: userRecord.user.username,
        email: userRecord.user.email,
        sessionId,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 hours
    }, JWT_SECRET);

    // Set HTTP-only cookie
    setCookie(context, 'auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
        maxAge: 60 * 60 * 24 // 24 hours
    });

    return {
        success: true,
        user: userRecord.user,
        csrfToken // Return CSRF token to client for subsequent requests
    };
};

async function checkAuth() {
    const context = getContext<HonoVarTypes>();
    const token = getCookie(context, 'auth_token');
    
    if (!token) {
        return { authenticated: false, user: null };
    }
    
    try {
        const payload = await verify(token, JWT_SECRET) as any;
        
        // Find user
        const userRecord = Array.from(mockUsers.values()).find(
            record => record.user.id === payload.sub
        );
        
        if (!userRecord) {
            return { authenticated: false, user: null };
        }

        return {
            authenticated: true,
            user: userRecord.user
        };
    } catch (error) {
        return { authenticated: false, user: null };
    }
}

async function logout() {
    const context = getContext<HonoVarTypes>();
    const token = getCookie(context, 'auth_token');
    
    if (token) {
        try {
            const payload = await verify(token, JWT_SECRET) as any;
            // Remove CSRF token
            if (payload.sessionId) {
                csrfTokens.delete(payload.sessionId);
            }
        } catch (error) {
            // Token invalid, just delete cookie
        }
    }

    deleteCookie(context, 'auth_token', { path: '/' });
    
    return { success: true };
}

async function getCSRFToken() {
    const context = getContext<HonoVarTypes>();
    const token = getCookie(context, 'auth_token');
    
    if (!token) {
        throw new Error('Not authenticated');
    }

    const payload = await verify(token, JWT_SECRET) as any;
    const stored = csrfTokens.get(payload.sessionId);
    
    if (!stored) {
        throw new Error('CSRF token not found');
    }

    return { csrfToken: stored.token };
}

export const authMethods = {
    register,
    login,
    checkAuth,
    logout,
    getCSRFToken,
};

export { validateCSRFToken };