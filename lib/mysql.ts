import { Pool, PoolClient } from 'pg'

// Create a connection pool for PostgreSQL - NO TIMEOUT
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DATABASE || 'ksystem_db',
  user: process.env.POSTGRES_USER || 'ksystem',
  password: process.env.POSTGRES_PASSWORD || 'Ksave2025Admin',
  max: 20, // Maximum pool size
  min: 5, // Keep minimum connections ready
  idleTimeoutMillis: 0, // NO idle timeout - keep connections alive forever
  connectionTimeoutMillis: 0, // NO connection timeout - wait forever if needed
  allowExitOnIdle: false, // Never exit on idle
  keepAlive: true, // Enable TCP keep-alive
  keepAliveInitialDelayMillis: 0, // Start keep-alive immediately
})

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err)
  // Don't exit the process
})

pool.on('connect', (client) => {
  console.log('Database connection established')
})

// Test connection on startup
;(async () => {
  try {
    const client = await pool.connect()
    console.log('PostgreSQL pool initialized successfully')
    client.release()
  } catch (err) {
    console.error('Failed to initialize PostgreSQL pool:', err)
  }
})()

/**
 * Execute PostgreSQL query with automatic retry
 * @param sql SQL query string
 * @param values Query parameters (optional)
 * @param retries Number of retry attempts (default: 2)
 * @returns Query results
 */
export async function query(sql: string, values?: any[], retries = 2): Promise<any[]> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    let client: PoolClient | null = null

    try {
      // Get client from pool - NO TIMEOUT
      client = await pool.connect()

      // Execute query - NO TIMEOUT
      const result = await client.query(sql, values)

      return result.rows

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`Database query error (attempt ${attempt + 1}/${retries + 1}):`, lastError.message)

      // If this is not the last attempt, wait before retrying
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)))
      }

    } finally {
      // Always release the client back to the pool
      if (client) {
        try {
          client.release()
        } catch (releaseError) {
          console.error('Error releasing client:', releaseError)
        }
      }
    }
  }

  // If all retries failed, throw the last error
  throw lastError || new Error('Query failed after retries')
}

// Export pool for advanced usage
export { pool }
