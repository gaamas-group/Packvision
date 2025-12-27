/**
 * User Database Layer
 *
 * TEMPORARY: In-memory user storage for development
 * TODO: Replace with PostgreSQL queries when database is integrated
 */

// Temporary in-memory user storage
const users = [
  {
    id: 1,
    username: 'admin',
    role: 'admin',
  },
  {
    id: 2,
    username: 'scanner',
    role: 'scanner',
  },
  {
    id: 3,
    username: 'packer',
    role: 'packer',
  },
];

/**
 * Find user by username
 * @param {string} username - Username to search for
 * @returns {Object|null} User object or null if not found
 */
export const findUserByUsername = (username) => {
  return users.find((user) => user.username === username) || null;
};

/**
 * Find user by ID
 * @param {number} userId - User ID to search for
 * @returns {Object|null} User object or null if not found
 */
export const findUserById = (userId) => {
  return users.find((user) => user.id === userId) || null;
};
