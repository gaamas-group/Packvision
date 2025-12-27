/**
 * Refresh Token Storage Layer
 *
 * TEMPORARY: In-memory storage for development
 * TODO: Replace with PostgreSQL queries when database is integrated
 *
 * Database schema suggestion for PostgreSQL:
 * CREATE TABLE refresh_tokens (
 *   id SERIAL PRIMARY KEY,
 *   user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
 *   token TEXT NOT NULL,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   expires_at TIMESTAMP NOT NULL
 * );
 * CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
 */

// Temporary in-memory storage for refresh tokens
// Structure: { token: string, userId: number, createdAt: Date }
const refreshTokens = new Map();

/**
 * Save a refresh token
 *
 * PostgreSQL equivalent:
 * INSERT INTO refresh_tokens (user_id, token, expires_at)
 * VALUES ($1, $2, NOW() + INTERVAL '8 hours')
 *
 * @param {number} userId - User ID
 * @param {string} token - Refresh token
 */
export const saveRefreshToken = (userId, token) => {
  refreshTokens.set(token, {
    userId,
    createdAt: new Date(),
  });
};

/**
 * Find a refresh token
 *
 * PostgreSQL equivalent:
 * SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()
 *
 * @param {string} token - Refresh token to find
 * @returns {Object|null} Token data or null if not found
 */
export const findRefreshToken = (token) => {
  return refreshTokens.get(token) || null;
};

/**
 * Delete a refresh token (for logout)
 *
 * PostgreSQL equivalent:
 * DELETE FROM refresh_tokens WHERE token = $1
 *
 * @param {string} token - Refresh token to delete
 * @returns {boolean} True if token was deleted
 */
export const deleteRefreshToken = (token) => {
  return refreshTokens.delete(token);
};

/**
 * Delete all refresh tokens for a user (useful for logout from all devices)
 *
 * PostgreSQL equivalent:
 * DELETE FROM refresh_tokens WHERE user_id = $1
 *
 * @param {number} userId - User ID
 * @returns {number} Number of tokens deleted
 */
export const deleteAllUserTokens = (userId) => {
  let count = 0;
  for (const [token, data] of refreshTokens.entries()) {
    if (data.userId === userId) {
      refreshTokens.delete(token);
      count++;
    }
  }
  return count;
};
