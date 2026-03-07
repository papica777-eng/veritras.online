//! API Validators - Check if extracted keys are valid

use reqwest::Client;

pub struct ApiValidator {
    client: Client,
}

impl ApiValidator {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
        }
    }

    /// Validate an API key by service
    pub async fn validate(&self, service: &str, key: &str) -> bool {
        match service {
            "OpenAI" => self.validate_openai(key).await,
            "GitHub" => self.validate_github(key).await,
            "Stripe_Live" | "Stripe_Test" => self.validate_stripe(key).await,
            _ => false, // Unknown service
        }
    }

    async fn validate_openai(&self, key: &str) -> bool {
        let res = self.client
            .get("https://api.openai.com/v1/models")
            .header("Authorization", format!("Bearer {}", key))
            .send()
            .await;
        
        matches!(res, Ok(r) if r.status().is_success())
    }

    async fn validate_github(&self, key: &str) -> bool {
        let res = self.client
            .get("https://api.github.com/user")
            .header("Authorization", format!("token {}", key))
            .header("User-Agent", "MAGNET-Protocol")
            .send()
            .await;
        
        matches!(res, Ok(r) if r.status().is_success())
    }

    async fn validate_stripe(&self, key: &str) -> bool {
        let res = self.client
            .get("https://api.stripe.com/v1/balance")
            .header("Authorization", format!("Bearer {}", key))
            .send()
            .await;
        
        matches!(res, Ok(r) if r.status().is_success())
    }
}

impl Default for ApiValidator {
    fn default() -> Self {
        Self::new()
    }
}
