//! Teleporter Core - Streaming state transfer

use std::sync::Arc;
use tokio::sync::mpsc;
// use futures::StreamExt;

pub struct Teleporter {
    batch_size: usize,
    _parallel_streams: usize,
}

pub struct TeleportBatch {
    pub table: String,
    pub offset: u64,
    pub data: Vec<Vec<u8>>,
    pub checksum: String,
}

impl Teleporter {
    pub fn new(batch_size: usize, parallel_streams: usize) -> Self {
        Self {
            batch_size,
            _parallel_streams: parallel_streams,
        }
    }

    /// Stream data from source to destination
    pub async fn stream_transfer<S, D>(
        &self,
        source: S,
        destination: D,
        tables: Vec<String>,
        progress_tx: mpsc::Sender<(u64, u64)>,
    ) -> Result<(), Box<dyn std::error::Error>>
    where
        S: DataSource + Send + Sync + 'static,
        D: DataDestination + Send + Sync + 'static,
    {
        let source = Arc::new(source);
        let destination = Arc::new(destination);

        for table in tables {
            let total = source.count(&table).await?;
            let mut offset = 0u64;

            while offset < total {
                let batch = source.read_batch(&table, offset, self.batch_size).await?;
                let batch_len = batch.data.len() as u64;

                destination.write_batch(&batch).await?;

                offset += batch_len;
                let _ = progress_tx.send((offset, total)).await;
            }
        }

        Ok(())
    }
}

#[async_trait::async_trait]
pub trait DataSource {
    async fn count(&self, table: &str) -> Result<u64, Box<dyn std::error::Error>>;
    async fn read_batch(
        &self,
        table: &str,
        offset: u64,
        limit: usize,
    ) -> Result<TeleportBatch, Box<dyn std::error::Error>>;
}

#[async_trait::async_trait]
pub trait DataDestination {
    async fn write_batch(&self, batch: &TeleportBatch) -> Result<(), Box<dyn std::error::Error>>;
}
