//! Secret Extractors - Pattern matching for API keys, wallets, etc.

use regex::Regex;

pub struct ExtractedKey {
    pub service: String,
    pub key: String,
}

pub struct ExtractedWallet {
    pub chain: String,
    pub address: String,
}

pub struct SecretExtractor {
    patterns: Vec<(String, Regex)>,
    wallet_patterns: Vec<(String, Regex)>,
}

impl SecretExtractor {
    pub fn new() -> Self {
        Self {
            patterns: vec![
                // AWS
                ("AWS".to_string(), Regex::new(r"AKIA[0-9A-Z]{16}").unwrap()),
                ("AWS_SECRET".to_string(), Regex::new(r#"(?i)aws_secret_access_key\s*[=:]\s*['\"]?([A-Za-z0-9/+=]{40})['\"]?"#).unwrap()),
                
                // GitHub
                ("GitHub".to_string(), Regex::new(r"ghp_[A-Za-z0-9]{36}").unwrap()),
                ("GitHub_OAuth".to_string(), Regex::new(r"gho_[A-Za-z0-9]{36}").unwrap()),
                
                // OpenAI
                ("OpenAI".to_string(), Regex::new(r"sk-[A-Za-z0-9]{48}").unwrap()),
                
                // Stripe
                ("Stripe_Live".to_string(), Regex::new(r"sk_live_[A-Za-z0-9]{24,}").unwrap()),
                ("Stripe_Test".to_string(), Regex::new(r"sk_test_[A-Za-z0-9]{24,}").unwrap()),
                
                // Google
                ("Google_API".to_string(), Regex::new(r"AIza[A-Za-z0-9_-]{35}").unwrap()),
                
                // Slack
                ("Slack".to_string(), Regex::new(r"xox[baprs]-[A-Za-z0-9-]{10,}").unwrap()),
                
                // Discord
                ("Discord".to_string(), Regex::new(r"[MN][A-Za-z\d]{23,}\.[\w-]{6}\.[\w-]{27}").unwrap()),
                
                // Twilio
                ("Twilio".to_string(), Regex::new(r"SK[a-f0-9]{32}").unwrap()),
                
                // SendGrid
                ("SendGrid".to_string(), Regex::new(r"SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}").unwrap()),
                
                // Generic API Key pattern
                ("Generic_API".to_string(), Regex::new(r#"(?i)(api[_-]?key|apikey|api[_-]?secret)\s*[=:]\s*['\"]?([A-Za-z0-9_-]{20,})['\"]?"#).unwrap()),
                
                // Database URLs
                ("Database_URL".to_string(), Regex::new(r"(?i)(postgres|mysql|mongodb|redis)://[^\s]+").unwrap()),
                
                // Private Keys
                ("Private_Key".to_string(), Regex::new(r"-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----").unwrap()),
            ],
            wallet_patterns: vec![
                // Ethereum
                ("ETH".to_string(), Regex::new(r"0x[a-fA-F0-9]{40}").unwrap()),
                
                // Bitcoin
                ("BTC".to_string(), Regex::new(r"[13][a-km-zA-HJ-NP-Z1-9]{25,34}").unwrap()),
                ("BTC_Bech32".to_string(), Regex::new(r"bc1[a-zA-HJ-NP-Z0-9]{39,59}").unwrap()),
                
                // Solana
                ("SOL".to_string(), Regex::new(r"[1-9A-HJ-NP-Za-km-z]{32,44}").unwrap()),
            ],
        }
    }

    pub fn extract_api_key(&self, line: &str) -> Option<ExtractedKey> {
        for (service, pattern) in &self.patterns {
            if let Some(captures) = pattern.captures(line) {
                let key = captures.get(0).map(|m| m.as_str().to_string())?;
                return Some(ExtractedKey {
                    service: service.clone(),
                    key,
                });
            }
        }
        None
    }

    pub fn extract_wallet(&self, line: &str) -> Option<ExtractedWallet> {
        for (chain, pattern) in &self.wallet_patterns {
            if let Some(captures) = pattern.captures(line) {
                let address = captures.get(0).map(|m| m.as_str().to_string())?;
                // Skip if it looks like a hash or other non-wallet string
                if address.len() < 26 || address.len() > 64 {
                    continue;
                }
                return Some(ExtractedWallet {
                    chain: chain.clone(),
                    address,
                });
            }
        }
        None
    }
}

impl Default for SecretExtractor {
    fn default() -> Self {
        Self::new()
    }
}
