/// vector_memory — Qantum Rust Module
/// Path: src/departments/reality/lwas/chemistry/evolution/cli/src/lwas_core/omega/vector_memory.rs
/// Auto-documented by BrutalDocEngine v2.1

use ndarray::{Array1, Array2, Axis};
use rayon::prelude::*;
use std::sync::{Arc, Mutex};
use anyhow::Result;
use walkdir::WalkDir;
use std::fs;
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

pub struct SovereignVectorIndex {
    // Stores embeddings: rows = documents, cols = dimensions (e.g., 384)
    // Wrapped in Mutex for thread-safe upserts during parallel ingestion
    vectors: Mutex<Vec<Array1<f32>>>,
    metadata: Mutex<Vec<String>>,
}

impl SovereignVectorIndex {
    // Complexity: O(1)
    pub fn new() -> Self {
        Self {
            vectors: Mutex::new(Vec::new()),
            metadata: Mutex::new(Vec::new()),
        }
    }

    // Complexity: O(1)
    pub fn upsert(&self, vector: Array1<f32>, meta: String) {
        let mut vecs = self.vectors.lock().unwrap();
        let mut metas = self.metadata.lock().unwrap();
        
        vecs.push(vector);
        metas.push(meta);
    }

    /// Performs a cosine similarity search against the index.
    /// Returns top results (score, metadata).
    // Complexity: O(N log N) — sort operation
    pub fn search(&self, query_vec: &Array1<f32>, limit: usize) -> Vec<(f32, String)> {
        let vecs = self.vectors.lock().unwrap();
        let metas = self.metadata.lock().unwrap();

        let query_norm = query_vec.dot(query_vec).sqrt();
        if query_norm == 0.0 {
            return vec![];
        }

        let mut scores: Vec<(f32, usize)> = vecs.par_iter()
            .enumerate()
            .map(|(i, vec)| {
                let doc_norm = vec.dot(vec).sqrt();
                if doc_norm == 0.0 {
                    (0.0, i)
                } else {
                    let dot_product = query_vec.dot(vec);
                    let cosine_sim = dot_product / (query_norm * doc_norm);
                    (cosine_sim, i)
                }
            })
            .collect();

        // Sort by score descending
        scores.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));

        scores.into_iter()
            .take(limit)
            .map(|(score, idx)| (score, metas[idx].clone()))
            .collect()
    }
}

pub struct VectorSyncCore {
    index: Arc<SovereignVectorIndex>,
}

impl VectorSyncCore {
    // Complexity: O(1)
    pub fn new(index: Arc<SovereignVectorIndex>) -> Self {
        Self { index }
    }

    // Complexity: O(N) — linear iteration
    pub fn sync_empire(&self, root_path: &str) {
        println!("[MEMORY] Initiating Semantic Ingestion from '{}'...", root_path);

        // 1. Collect file paths (single thread walk, fast enough)
        let entries: Vec<_> = WalkDir::new(root_path)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| e.file_type().is_file())
            .filter(|e| {
                // Filter logic: only rs/ts/js files for now
                if let Some(ext) = e.path().extension() {
                    let s = ext.to_string_lossy();
                    s == "rs" || s == "ts" || s == "js"
                } else {
                    false
                }
            })
            .collect();

        println!("[MEMORY] Found {} artifacts. Parallelizing ingestion...", entries.len());

        // 2. Parallel Ingestion
        entries.par_iter().for_each(|entry| {
            if let Ok(content) = fs::read_to_string(entry.path()) {
                // Generate Mock Embedding (Deterministic based on content hash)
                let vector = self.generate_mock_embedding(&content);
                let meta = format!("{:?}", entry.path());
                
                self.index.upsert(vector, meta);
            }
        });

        println!("[MEMORY] Empire Sync Complete. 100% Logic Density achieved.");
    }

    // Complexity: O(N*M) — nested iteration detected
    fn generate_mock_embedding(&self, content: &str) -> Array1<f32> {
        // Simulating 384-dimensional embedding
        // We use hashing to make it deterministic for the same content
        let mut hasher = DefaultHasher::new();
        content.hash(&mut hasher);
        let seed = hasher.finish();
        
        // Simple seeded RNG for mock vector
        let mut rng = seed; 
        let vec: Vec<f32> = (0..384).map(|_| {
            rng = rng.wrapping_mul(6364136223846793005).wrapping_add(1);
            (rng as f32 / u64::MAX as f32) // 0.0 to 1.0
        }).collect();
        
        Array1::from(vec)
    }
}
