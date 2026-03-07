# Hybrid Rust/Python Backend
FROM python:3.11-slim

# Install Rust toolchain
RUN apt-get update && apt-get install -y curl build-essential && \
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /app

# Copy Requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Project
COPY . .

# Build Rust Core (Neural)
WORKDIR /app/rust_core
RUN cargo build --release

# Build Telemetry Reporter (Hardware)
WORKDIR /app/telemetry
RUN cargo build --release

WORKDIR /app

# Expose Ports (HTTP + WS)
ENV PORT=8080
EXPOSE 8080 8765

# Start the Core
CMD ["python", "OmniCore.py"]
