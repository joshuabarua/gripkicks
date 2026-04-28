import { Context, Next } from 'hono'
import { auth } from '../config/auth.config'
import type { User } from 'better-auth/types'

type AuthContext = Context<{
    Variables: {
        user: User;
        session: any;
    }
}>

async function validateSession(c: AuthContext) {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })

    if (!session || !session.user) {
        return c.json(
            {
                success: false,
                message: 'Unauthorized',
                error: 'No valid session found',
            },
            401
        )
    }

    c.set('user', session.user)
    c.set('session', session.session)

    return session
}

// Middleware to protect routes from unauthorized access
export const protect = async (c: AuthContext, next: Next) => {
    const session = await validateSession(c)

    if (typeof session === 'object' && 'status' in session) {
        return session
    }

    console.log(session.user)
    await next()
}

// Middleware to protect admin routes
export const isAdmin = async (c: AuthContext, next: Next) => {
    const sessionResult = await validateSession(c)

    if (sessionResult && typeof sessionResult === 'object' && 'status' in sessionResult) {
        return sessionResult
    }

    const user = sessionResult.user as typeof sessionResult.user & { isAdmin?: boolean };
    if (!user.isAdmin) {
        return c.json(
            {
                success: false,
                message: 'Unauthorized',
                error: 'User is not an admin',
            },
            403
        )
    }

    await next()
}