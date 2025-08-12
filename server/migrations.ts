import { db } from "./db";
import { users, sessions, conversations, feedbacks } from "@shared/schema";

async function runMigrations() {
  console.log("Running database migrations...");
  
  try {
    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Users table created or already exists");

    // Create sessions table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        session_id TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
      )
    `);
    console.log("Sessions table created or already exists");

    // Create conversations table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        session_id TEXT REFERENCES sessions(session_id) ON DELETE CASCADE,
        thread_id TEXT NOT NULL,
        assistant_type TEXT NOT NULL,
        messages JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Conversations table created or already exists");

    // Create feedbacks table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id SERIAL PRIMARY KEY,
        session_id TEXT REFERENCES sessions(session_id) ON DELETE CASCADE,
        summary TEXT,
        content_knowledge_score INTEGER,
        writing_score INTEGER,
        next_steps TEXT,
        grade INTEGER,
        max_grade INTEGER DEFAULT 100,
        submitted_to_lms BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Feedbacks table created or already exists");

    // Create LTI platforms table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS lti_platforms (
        id SERIAL PRIMARY KEY,
        issuer TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        client_id TEXT NOT NULL,
        authentication_endpoint TEXT NOT NULL,
        accesstoken_endpoint TEXT NOT NULL,
        auth_config JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("LTI platforms table created or already exists");

    // Create LTI deployments table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS lti_deployments (
        id SERIAL PRIMARY KEY,
        platform_id INTEGER REFERENCES lti_platforms(id),
        deployment_id TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("LTI deployments table created or already exists");

    // Create LTI registrations table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS lti_registrations (
        id SERIAL PRIMARY KEY,
        platform_id INTEGER REFERENCES lti_platforms(id),
        key_set JSONB NOT NULL,
        private_key TEXT NOT NULL,
        public_key TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("LTI registrations table created or already exists");

    // Create LTI contexts table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS lti_contexts (
        id SERIAL PRIMARY KEY,
        platform_id INTEGER REFERENCES lti_platforms(id),
        context_id TEXT NOT NULL,
        context_type TEXT,
        context_title TEXT,
        context_label TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("LTI contexts table created or already exists");

    // Create LTI users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS lti_users (
        id SERIAL PRIMARY KEY,
        platform_id INTEGER REFERENCES lti_platforms(id),
        lti_user_id TEXT NOT NULL,
        name TEXT,
        given_name TEXT,
        family_name TEXT,
        email TEXT,
        roles TEXT[],
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("LTI users table created or already exists");

    // Create tenants table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tenants (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        domain TEXT UNIQUE,
        platform_id INTEGER REFERENCES lti_platforms(id),
        config JSONB,
        system_prompt TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Tenants table created or already exists");

    // Create LTI grades table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS lti_grades (
        id SERIAL PRIMARY KEY,
        session_id TEXT REFERENCES sessions(session_id) ON DELETE CASCADE,
        lti_user_id INTEGER REFERENCES lti_users(id),
        lineitem_id TEXT,
        score INTEGER,
        max_score INTEGER DEFAULT 100,
        submission_status TEXT DEFAULT 'pending',
        submitted_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("LTI grades table created or already exists");

    // Create content packages table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS content_packages (
        id SERIAL PRIMARY KEY,
        package_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        district TEXT NOT NULL,
        course TEXT NOT NULL,
        topic TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        published_at TIMESTAMP,
        version INTEGER NOT NULL DEFAULT 1
      )
    `);
    console.log("Content packages table created or already exists");

    // Create content components table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS content_components (
        id SERIAL PRIMARY KEY,
        package_id INTEGER NOT NULL REFERENCES content_packages(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        data JSONB NOT NULL,
        ordering INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Content components table created or already exists");

    // Create content creation sessions table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS content_creation_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        package_id INTEGER REFERENCES content_packages(id) ON DELETE CASCADE,
        current_step INTEGER NOT NULL DEFAULT 1,
        wizard_data JSONB NOT NULL DEFAULT '{}',
        conversation_history JSONB NOT NULL DEFAULT '[]',
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      )
    `);
    console.log("Content creation sessions table created or already exists");

    // Create content permissions table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS content_permissions (
        id SERIAL PRIMARY KEY,
        package_id INTEGER NOT NULL REFERENCES content_packages(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id),
        permission TEXT NOT NULL DEFAULT 'view',
        granted_by INTEGER REFERENCES users(id),
        granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Content permissions table created or already exists");

    console.log("All migrations completed successfully");
  } catch (error) {
    console.error("Error running migrations:", error);
    throw error;
  }
}

export { runMigrations };