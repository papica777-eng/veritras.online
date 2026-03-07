//! ═══════════════════════════════════════════════════════════════════════════════
//! 🧲 MAGNET PROTOCOL - Scavenger AI
//! ═══════════════════════════════════════════════════════════════════════════════
//!
//! Deep-substrate data extraction protocol. Scans millions of files to extract
//! hidden capital, API keys, and reusable intelligence.
//!
//! Target: 100,000+ files/cycle
//!
//! @author Dimitar Prodromov / QAntum Empire

#![deny(clippy::all)]

#[macro_use]
extern crate napi_derive;

pub mod scanner;
pub mod extractors;
pub mod validators;
pub mod storage;

use napi::bindgen_prelude::*;
use std::path::PathBuf;
use scanner::FileScanner;
use extractors::SecretExtractor;

/// Scan result exposed to TypeScript
#[napi(object)]
pub struct ScanResult {
    pub total_files: u32,
    pub scanned_files: u32,
    pub secrets_found: u32,
    pub api_keys: Vec<ApiKeyResult>,
    pub wallets: Vec<WalletResult>,
    pub duration_ms: u32,
}

#[napi(object)]
pub struct ApiKeyResult {
    pub service: String,
    pub key_prefix: String,
    pub file_path: String,
    pub line_number: u32,
    pub is_valid: Option<bool>,
}

#[napi(object)]
pub struct WalletResult {
    pub chain: String,
    pub address: String,
    pub file_path: String,
    pub potential_value: Option<f64>,
}

/// Initialize MAGNET scanner
#[napi]
pub fn init_magnet() -> String {
    println!("╔════════════════════════════════════════════════════════════╗");
    println!("║   🧲 MAGNET PROTOCOL - Scavenger AI                        ║");
    println!("║   Deep-substrate data extraction                           ║");
    println!("╚════════════════════════════════════════════════════════════╝");
    
    "🧲 MAGNET PROTOCOL: ARMED".to_string()
}

/// Scan a directory for secrets (async, exposed to TypeScript)
#[napi]
pub async fn scan_directory(path: String, max_depth: Option<u32>) -> Result<ScanResult> {
    let start = std::time::Instant::now();
    
    let scanner = FileScanner::new(PathBuf::from(&path), max_depth.unwrap_or(10));
    let extractor = SecretExtractor::new();
    
    let files = scanner.scan().map_err(|e| Error::from_reason(e.to_string()))?;
    let total_files = files.len() as u32;
    
    let mut api_keys = Vec::new();
    let mut wallets = Vec::new();
    let mut scanned = 0u32;
    
    for file in files {
        if let Ok(content) = std::fs::read_to_string(&file) {
            scanned += 1;
            
            // Extract API keys
            for (line_num, line) in content.lines().enumerate() {
                if let Some(key) = extractor.extract_api_key(line) {
                    api_keys.push(ApiKeyResult {
                        service: key.service,
                        key_prefix: key.key[..8.min(key.key.len())].to_string(),
                        file_path: file.to_string_lossy().to_string(),
                        line_number: line_num as u32 + 1,
                        is_valid: None,
                    });
                }
                
                // Extract wallets
                if let Some(wallet) = extractor.extract_wallet(line) {
                    wallets.push(WalletResult {
                        chain: wallet.chain,
                        address: wallet.address,
                        file_path: file.to_string_lossy().to_string(),
                        potential_value: None,
                    });
                }
            }
        }
    }
    
    let duration = start.elapsed().as_millis() as u32;
    
    Ok(ScanResult {
        total_files,
        scanned_files: scanned,
        secrets_found: api_keys.len() as u32 + wallets.len() as u32,
        api_keys,
        wallets,
        duration_ms: duration,
    })
}

/// Quick scan for API keys only
#[napi]
pub fn quick_scan_keys(content: String) -> Vec<String> {
    let extractor = SecretExtractor::new();
    let mut results = Vec::new();
    
    for line in content.lines() {
        if let Some(key) = extractor.extract_api_key(line) {
            results.push(format!("{}: {}...", key.service, &key.key[..8.min(key.key.len())]));
        }
    }
    
    results
}
