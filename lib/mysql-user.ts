import mysql from 'mysql2/promise'

// Create MySQL connection pool for user database
const pool = mysql.createPool({
  host: 'localhost', // Docker container mapped to localhost
  port: 3307, // Docker mapped port
  user: 'root',
  password: 'Zera2025data',
  database: 'user',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
})

// Test connection on initialization
pool.getConnection()
  .then(connection => {
    console.log('✅ MySQL user database connection pool initialized successfully')
    connection.release()
  })
  .catch(err => {
    console.error('❌ Failed to initialize MySQL user database connection pool:', err.message)
  })

/**
 * Execute MySQL query with automatic connection management
 * @param sql SQL query string
 * @param values Query parameters (optional)
 * @returns Query results
 */
export async function queryUser(sql: string, values?: any[]): Promise<any[]> {
  const connection = await pool.getConnection()

  try {
    const [rows] = await connection.execute(sql, values)
    return rows as any[]
  } finally {
    connection.release()
  }
}

/**
 * Authenticate user login
 * @param username Username
 * @param password Password (plain text - will be compared with hashed)
 * @param site Site/Branch
 * @returns User data if authenticated, null otherwise
 */
export async function authenticateUser(
  username: string,
  password: string,
  site?: string
): Promise<{
  userId: number
  userName: string
  name: string
  email: string
  site: string
  typeID: number
} | null> {
  const sql = `
    SELECT userId, userName, name, email, site, password, typeID
    FROM user_list
    WHERE userName = ?
    LIMIT 1
  `

  const connection = await pool.getConnection()

  try {
    const [rows] = await connection.execute(sql, [username])
    const users = rows as any[]

    if (users.length === 0) {
      return null
    }

    const user = users[0]

    // Check if password matches (plain text comparison for now)
    // TODO: Use bcrypt for password hashing in production
    if (user.password !== password) {
      return null
    }

    // If site is provided, check if it matches
    if (site && user.site !== site) {
      return null
    }

    // Return user data (without password)
    return {
      userId: user.userId,
      userName: user.userName,
      name: user.name || '',
      email: user.email || '',
      site: user.site || '',
      typeID: user.typeID
    }
  } finally {
    connection.release()
  }
}

/**
 * Get user by ID
 * @param userId User ID
 * @returns User data
 */
export async function getUserById(userId: number): Promise<any | null> {
  const sql = `
    SELECT ul.userId, ul.userName, ul.name, ul.email, ul.site, ul.typeID,
           ct.TypeName, ct.departmentID, ct.departmentName
    FROM user_list ul
    LEFT JOIN cus_type ct ON ul.typeID = ct.typeID
    WHERE ul.userId = ?
    LIMIT 1
  `

  const connection = await pool.getConnection()

  try {
    const [rows] = await connection.execute(sql, [userId])
    const users = rows as any[]

    if (users.length === 0) {
      return null
    }

    return users[0]
  } finally {
    connection.release()
  }
}

// Export pool for advanced usage
export { pool }
