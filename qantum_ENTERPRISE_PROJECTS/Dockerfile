# MULTI-STAGE DOCKERFILE FOR AETERNA (RUST SUBSTRATE)
# Optimized for high-density capital extraction

FROM rust:1.85-slim as builder

RUN apt-get update && apt-get install -y pkg-config libssl-dev gcc g++ make perl && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/aeterna
COPY . .

# Build for release
RUN cargo build --release -p lwas_cli

# Runtime stage
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy binary
COPY --from=builder /usr/src/aeterna/target/release/lwas_cli /app/lwas_cli

# Copy necessary assets
COPY AETERNA_ANIMA.soul /AETERNA_ANIMA.soul
COPY tokenizer.json /app/tokenizer.json

# Create asset directories
RUN mkdir -p /app/assets/micro_saas

EXPOSE 8890

CMD ["./lwas_cli", "ignite"]
