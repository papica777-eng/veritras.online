//! Transform module for state mutation during teleportation.

pub trait Transformer {
    fn transform(&self, data: Vec<u8>) -> Vec<u8>;
}

pub struct NoOpTransformer;

impl Transformer for NoOpTransformer {
    fn transform(&self, data: Vec<u8>) -> Vec<u8> {
        data
    }
}
