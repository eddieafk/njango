import Serializer from './serializer.js';
import jwt from 'jsonwebtoken';
import { User, Token } from './models.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ACCESS_TOKEN_EXPIRY = '15m';  // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d';  // 7 days

class UserSerializer extends Serializer {
    constructor() {
        super(User, ['username', 'email', 'password']);
    }
}

const serializeUser = new UserSerializer()

class TokenObtainSerializer extends Serializer {
    constructor() {
        super(User, ['username', 'password']);
    }

    async generateTokens(user) {
        // Create access token
        const accessToken = jwt.sign(
            { user_id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRY }
        );

        // Create refresh token
        const refreshToken = jwt.sign(
            { user_id: user.id },
            JWT_SECRET,
            { expiresIn: REFRESH_TOKEN_EXPIRY }
        );

        // Store tokens in database
        const now = new Date();
        await Token.create({
            user_id: user.id,
            token: accessToken,
            type: 'access',
            expires_at: new Date(now.getTime() + 15 * 60000) // 15 minutes
        });

        await Token.create({
            user_id: user.id,
            token: refreshToken,
            type: 'refresh',
            expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60000) // 7 days
        });

        return {
            access: accessToken,
            refresh: refreshToken
        };
    }
}

class TokenRefreshSerializer extends Serializer {
    constructor() {
        super(Token, ['token']);
    }

    async refreshToken(refreshToken) {
        try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, JWT_SECRET);
            
            // Find user
            const user = await User.findByPk(decoded.user_id);
            if (!user) throw new Error('User not found');

            // Generate new access token
            const accessToken = jwt.sign(
                { user_id: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: ACCESS_TOKEN_EXPIRY }
            );

            // Store new access token
            await Token.create({
                user_id: user.id,
                token: accessToken,
                type: 'access',
                expires_at: new Date(Date.now() + 15 * 60000) // 15 minutes
            });

            return { access: accessToken };
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }
}

export { serializeUser, UserSerializer, TokenObtainSerializer, TokenRefreshSerializer };
