//! Destination handlers for various data sinks.

pub trait Destination {
    fn write(&self, data: Vec<u8>) -> Result<(), String>;
}
