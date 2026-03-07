//! Storage - SQLite database for scan results

use rusqlite::{Connection, Result};

pub struct Storage {
    conn: Connection,
}

impl Storage {
    pub fn new(path: &str) -> Result<Self> {
        let conn = Connection::open(path)?;
        
        conn.execute(
            "CREATE TABLE IF NOT EXISTS scans (
                id INTEGER PRIMARY KEY,
                path TEXT NOT NULL,
                total_files INTEGER,
                secrets_found INTEGER,
                duration_ms INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )?;
        
        conn.execute(
            "CREATE TABLE IF NOT EXISTS secrets (
                id INTEGER PRIMARY KEY,
                scan_id INTEGER,
                service TEXT NOT NULL,
                key_prefix TEXT NOT NULL,
                file_path TEXT NOT NULL,
                line_number INTEGER,
                is_valid INTEGER,
                FOREIGN KEY (scan_id) REFERENCES scans(id)
            )",
            [],
        )?;
        
        conn.execute(
            "CREATE TABLE IF NOT EXISTS wallets (
                id INTEGER PRIMARY KEY,
                scan_id INTEGER,
                chain TEXT NOT NULL,
                address TEXT NOT NULL,
                file_path TEXT NOT NULL,
                potential_value REAL,
                FOREIGN KEY (scan_id) REFERENCES scans(id)
            )",
            [],
        )?;
        
        Ok(Self { conn })
    }

    pub fn save_scan(&self, path: &str, total_files: u32, secrets_found: u32, duration_ms: u32) -> Result<i64> {
        self.conn.execute(
            "INSERT INTO scans (path, total_files, secrets_found, duration_ms) VALUES (?1, ?2, ?3, ?4)",
            (path, total_files, secrets_found, duration_ms),
        )?;
        
        Ok(self.conn.last_insert_rowid())
    }

    pub fn save_secret(&self, scan_id: i64, service: &str, key_prefix: &str, file_path: &str, line_number: u32) -> Result<()> {
        self.conn.execute(
            "INSERT INTO secrets (scan_id, service, key_prefix, file_path, line_number) VALUES (?1, ?2, ?3, ?4, ?5)",
            (scan_id, service, key_prefix, file_path, line_number),
        )?;
        Ok(())
    }

    pub fn save_wallet(&self, scan_id: i64, chain: &str, address: &str, file_path: &str) -> Result<()> {
        self.conn.execute(
            "INSERT INTO wallets (scan_id, chain, address, file_path) VALUES (?1, ?2, ?3, ?4)",
            (scan_id, chain, address, file_path),
        )?;
        Ok(())
    }
}
