//! PostgreSQL Source/Destination

use super::teleporter::{DataDestination, DataSource, TeleportBatch};
use tokio_postgres::{Client, NoTls};

pub struct PostgresSource {
    client: Client,
}

pub struct PostgresDestination {
    client: Client,
}

impl PostgresSource {
    pub async fn connect(url: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let (client, connection) = tokio_postgres::connect(url, NoTls).await?;

        // Spawn connection handler
        tokio::spawn(async move {
            if let Err(e) = connection.await {
                eprintln!("PostgreSQL connection error: {}", e);
            }
        });

        Ok(Self { client })
    }
}

#[async_trait::async_trait]
impl DataSource for PostgresSource {
    async fn count(&self, table: &str) -> Result<u64, Box<dyn std::error::Error>> {
        let row = self
            .client
            .query_one(&format!("SELECT COUNT(*) FROM {}", table), &[])
            .await?;

        let count: i64 = row.get(0);
        Ok(count as u64)
    }

    async fn read_batch(
        &self,
        table: &str,
        offset: u64,
        limit: usize,
    ) -> Result<TeleportBatch, Box<dyn std::error::Error>> {
        let rows = self
            .client
            .query(
                &format!("SELECT * FROM {} OFFSET {} LIMIT {}", table, offset, limit),
                &[],
            )
            .await?;

        let data: Vec<Vec<u8>> = rows
            .iter()
            .map(|row| {
                // Serialize row to bytes (simplified)
                serde_json::to_vec(&row.columns().iter().map(|c| c.name()).collect::<Vec<_>>())
                    .unwrap_or_default()
            })
            .collect();

        let checksum = blake3::hash(&data.concat()).to_hex().to_string();

        Ok(TeleportBatch {
            table: table.to_string(),
            offset,
            data,
            checksum,
        })
    }
}

impl PostgresDestination {
    pub async fn connect(url: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let (client, connection) = tokio_postgres::connect(url, NoTls).await?;

        tokio::spawn(async move {
            if let Err(e) = connection.await {
                eprintln!("PostgreSQL connection error: {}", e);
            }
        });

        Ok(Self { client })
    }
}

#[async_trait::async_trait]
impl DataDestination for PostgresDestination {
    async fn write_batch(&self, batch: &TeleportBatch) -> Result<(), Box<dyn std::error::Error>> {
        // Begin transaction
        let _ = self.client.query("BEGIN", &[]).await?;

        // Insert data (simplified - real impl would handle schema)
        for item in &batch.data {
            // Deserialize and insert
            println!(
                "🛸 [TELEPORT] Writing {} bytes to {}",
                item.len(),
                batch.table
            );
        }

        self.client.query("COMMIT", &[]).await?;

        Ok(())
    }
}
