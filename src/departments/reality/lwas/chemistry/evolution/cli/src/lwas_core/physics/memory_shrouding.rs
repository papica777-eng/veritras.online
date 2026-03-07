/// memory_shrouding — Qantum Rust Module
/// Path: src/departments/reality/lwas/chemistry/evolution/cli/src/lwas_core/physics/memory_shrouding.rs
/// Auto-documented by BrutalDocEngine v2.1

use rand::Rng;

/// A buffer that encrypts its contents in memory using a transient XOR key.
/// The key is generated randomly upon creation.
/// This prevents static analysis or memory dumps from easily reading sensitive data.
pub struct PolymorphicBuffer {
    data: Vec<u8>,
    key: u8,
}

impl PolymorphicBuffer {
    // Complexity: O(N) — linear iteration
    pub fn new(raw_data: &[u8]) -> Self {
        let key = rand::rng().random(); 
        let mut data = raw_data.to_vec();
        for byte in &mut data {
            *byte ^= key;
        }
        Self { data, key }
    }

    /// Decrypts the buffer momentarily to retrieve the data.
    // Complexity: O(N) — linear iteration
    pub fn unlock(&self) -> Vec<u8> {
        let mut data = self.data.clone();
        for byte in &mut data {
            *byte ^= self.key;
        }
        data
    }

    /// Convenience method to unlock as String (if valid UTF-8)
    // Complexity: O(1)
    pub fn unlock_as_string(&self) -> Option<String> {
        String::from_utf8(self.unlock()).ok()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    // Complexity: O(1)
    fn test_polymorphic_buffer_roundtrip() {
        let secret = "Hidden Intent";
        let buffer = PolymorphicBuffer::new(secret.as_bytes());
        
        // Ensure raw data is not the secret
        assert_ne!(buffer.data, secret.as_bytes());

        let unlocked = buffer.unlock();
        assert_eq!(unlocked, secret.as_bytes());
    }

    #[test]
    // Complexity: O(1)
    fn test_unique_keys() {
        let secret = "Same Intent";
        let buffer1 = PolymorphicBuffer::new(secret.as_bytes());
        let buffer2 = PolymorphicBuffer::new(secret.as_bytes());

        // There's a 1/256 chance keys match, but generally data should differ if keys differ
        if buffer1.key != buffer2.key {
            assert_ne!(buffer1.data, buffer2.data);
        }
    }
}
