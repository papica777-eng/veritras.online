//! File System Scanner - Parallel directory traversal

use std::path::PathBuf;
use walkdir::WalkDir;
use rayon::prelude::*;

pub struct FileScanner {
    root: PathBuf,
    max_depth: u32,
    extensions: Vec<String>,
}

impl FileScanner {
    pub fn new(root: PathBuf, max_depth: u32) -> Self {
        Self {
            root,
            max_depth,
            extensions: vec![
                "js", "ts", "py", "rs", "go", "java", "rb", "php",
                "json", "yaml", "yml", "toml", "env", "config",
                "txt", "md", "sh", "bat", "ps1"
            ].into_iter().map(String::from).collect(),
        }
    }

    /// Scan directory and return all matching files
    pub fn scan(&self) -> Result<Vec<PathBuf>, Box<dyn std::error::Error>> {
        let files: Vec<PathBuf> = WalkDir::new(&self.root)
            .max_depth(self.max_depth as usize)
            .into_iter()
            .par_bridge() // Parallel iteration with Rayon
            .filter_map(|e| e.ok())
            .filter(|e| e.file_type().is_file())
            .filter(|e| self.should_scan(e.path()))
            .map(|e| e.path().to_path_buf())
            .collect();

        println!("🧲 [MAGNET] Found {} scannable files", files.len());
        Ok(files)
    }

    fn should_scan(&self, path: &std::path::Path) -> bool {
        // Skip node_modules, .git, etc.
        let path_str = path.to_string_lossy();
        if path_str.contains("node_modules") 
            || path_str.contains(".git")
            || path_str.contains("target")
            || path_str.contains("dist") {
            return false;
        }

        // Check extension
        if let Some(ext) = path.extension() {
            return self.extensions.contains(&ext.to_string_lossy().to_string());
        }
        
        // Also scan files without extension (could be .env, Dockerfile, etc.)
        path.file_name()
            .map(|n| n.to_string_lossy())
            .map(|n| n.starts_with('.') || !n.contains('.'))
            .unwrap_or(false)
    }
}
