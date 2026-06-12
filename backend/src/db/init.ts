import { query, pool } from "./index";

export async function initializeDatabase() {
  if (!pool) {
    console.log("[DB] No DATABASE_URL provided. Skipping initialization.");
    return;
  }

  console.log("[DB] Initializing database schema...");

  try {
    // 1. Incidents Table
    await query(`
      CREATE TABLE IF NOT EXISTS incidents (
        id VARCHAR PRIMARY KEY,
        title VARCHAR NOT NULL,
        type VARCHAR NOT NULL,
        station VARCHAR NOT NULL,
        position_lat FLOAT NOT NULL,
        position_lng FLOAT NOT NULL,
        radius_meters INT NOT NULL,
        risk_level VARCHAR NOT NULL,
        color VARCHAR NOT NULL,
        triggered_at TIMESTAMP NOT NULL
      );
    `);

    // 2. Trains Table
    await query(`
      CREATE TABLE IF NOT EXISTS trains (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        current_lat FLOAT NOT NULL,
        current_lng FLOAT NOT NULL,
        status VARCHAR NOT NULL
      );
    `);

    // 3. Agent Decisions Table
    await query(`
      CREATE TABLE IF NOT EXISTS agent_decisions (
        id VARCHAR PRIMARY KEY,
        incident_id VARCHAR REFERENCES incidents(id) ON DELETE CASCADE,
        agent_id VARCHAR NOT NULL,
        status VARCHAR NOT NULL,
        confidence INT,
        summary TEXT,
        data JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 4. Timeline Events Table
    await query(`
      CREATE TABLE IF NOT EXISTS timeline_events (
        id VARCHAR PRIMARY KEY,
        incident_id VARCHAR REFERENCES incidents(id) ON DELETE CASCADE,
        agent_id VARCHAR,
        event_description TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL
      );
    `);

    // 5. Reports Table
    await query(`
      CREATE TABLE IF NOT EXISTS reports (
        id VARCHAR PRIMARY KEY,
        incident_id VARCHAR REFERENCES incidents(id) ON DELETE CASCADE,
        summary TEXT NOT NULL,
        actions JSONB NOT NULL,
        resources JSONB NOT NULL,
        impact JSONB NOT NULL,
        generated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 6. Explainable Decisions Table
    await query(`
      CREATE TABLE IF NOT EXISTS explainable_decisions (
        id VARCHAR PRIMARY KEY,
        incident_id VARCHAR REFERENCES incidents(id) ON DELETE CASCADE,
        decision TEXT NOT NULL,
        confidence INT NOT NULL,
        reason TEXT NOT NULL,
        expected_impact TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("[DB] Schema initialization complete.");
  } catch (error) {
    console.error("[DB] Failed to initialize schema:", error);
    throw error;
  }
}

// Allow running this script directly
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
