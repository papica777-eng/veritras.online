//! ═══════════════════════════════════════════════════════════════════════════════
//! 🧠 NEURAL SUBSTRATE - Vector Memory + ML Infrastructure
//! ═══════════════════════════════════════════════════════════════════════════════
//!
//! SIMD-optimized vector operations and persistent storage.
//!
//! Target: Billions of vectors, sub-5ms search
//!
//! @author Dimitar Prodromov / QAntum Empire

#![deny(clippy::all)]

#[macro_use]
extern crate napi_derive;

pub mod vectors;
pub mod storage;
pub mod search;

use napi::bindgen_prelude::*;
use ndarray::{Array1, ArrayView1};
use std::collections::HashMap;

/// Vector with metadata
#[napi(object)]
pub struct Vector {
    pub id: String,
    pub values: Vec<f64>,
    pub metadata: Option<String>, // JSON metadata
    pub namespace: Option<String>,
}

/// Search result
#[napi(object)]
pub struct SearchResult {
    pub id: String,
    pub score: f64,
    pub values: Option<Vec<f64>>,
    pub metadata: Option<String>,
}

/// Insert result
#[napi(object)]
pub struct InsertResult {
    pub success: bool,
    pub inserted_count: u32,
    pub duration_ms: u32,
}

/// Initialize Neural Substrate
#[napi]
pub fn init_substrate() -> String {
    println!("╔════════════════════════════════════════════════════════════╗");
    println!("║   🧠 NEURAL SUBSTRATE - Vector Memory                      ║");
    println!("║   Zero-loss learning infrastructure                        ║");
    println!("╚════════════════════════════════════════════════════════════╝");
    
    "🧠 NEURAL SUBSTRATE: ONLINE".to_string()
}

/// Calculate cosine similarity between two vectors
#[napi]
pub fn cosine_similarity(a: Vec<f64>, b: Vec<f64>) -> f64 {
    vectors::simd::cosine_similarity(&a, &b)
}

/// Calculate euclidean distance between two vectors
#[napi]
pub fn euclidean_distance(a: Vec<f64>, b: Vec<f64>) -> f64 {
    vectors::simd::euclidean_distance(&a, &b)
}

/// Calculate dot product
#[napi]
pub fn dot_product(a: Vec<f64>, b: Vec<f64>) -> f64 {
    vectors::simd::dot_product(&a, &b)
}

/// Normalize a vector to unit length
#[napi]
pub fn normalize_vector(v: Vec<f64>) -> Vec<f64> {
    vectors::simd::normalize(&v)
}

/// Search for similar vectors
#[napi]
pub fn search_vectors(
    query: Vec<f64>,
    vectors: Vec<Vector>,
    k: u32,
    metric: Option<String>,
) -> Vec<SearchResult> {
    let metric = metric.unwrap_or_else(|| "cosine".to_string());
    
    let mut scores: Vec<(String, f64, Option<Vec<f64>>, Option<String>)> = vectors
        .iter()
        .map(|v| {
            let score = match metric.as_str() {
                "euclidean" => -vectors::simd::euclidean_distance(&query, &v.values),
                "dot" => vectors::simd::dot_product(&query, &v.values),
                _ => vectors::simd::cosine_similarity(&query, &v.values),
            };
            (v.id.clone(), score, Some(v.values.clone()), v.metadata.clone())
        })
        .collect();
    
    // Sort by score descending
    scores.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
    
    // Take top k
    scores
        .into_iter()
        .take(k as usize)
        .map(|(id, score, values, metadata)| SearchResult {
            id,
            score,
            values,
            metadata,
        })
        .collect()
}

/// Generate random vector for testing
#[napi]
pub fn random_vector(dimensions: u32) -> Vec<f64> {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    (0..dimensions).map(|_| rng.gen_range(-1.0..1.0)).collect()
}

/// Batch insert vectors
#[napi]
pub fn batch_insert(vectors: Vec<Vector>) -> InsertResult {
    let start = std::time::Instant::now();
    let count = vectors.len() as u32;
    
    // In real implementation, this would persist to storage
    println!("🧠 [SUBSTRATE] Inserting {} vectors", count);
    
    InsertResult {
        success: true,
        inserted_count: count,
        duration_ms: start.elapsed().as_millis() as u32,
    }
}
