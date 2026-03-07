#!/bin/bash

# AETERNA Build Script
# Builds all components of the AETERNA system

set -e  # Exit on error

echo "🚀 AETERNA Build Script"
echo "======================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    print_error "Cargo not found. Please install Rust: https://rustup.rs/"
    exit 1
fi

print_status "Rust toolchain found: $(rustc --version)"

# Parse arguments
BUILD_MODE="release"
BUILD_TARGET=""
SKIP_UI=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dev)
            BUILD_MODE="dev"
            shift
            ;;
        --release)
            BUILD_MODE="release"
            shift
            ;;
        --cli)
            BUILD_TARGET="lwas_cli"
            shift
            ;;
        --core)
            BUILD_TARGET="lwas_core"
            shift
            ;;
        --parser)
            BUILD_TARGET="lwas_parser"
            shift
            ;;
        --skip-ui)
            SKIP_UI=true
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --dev          Build in development mode (faster, with debug info)"
            echo "  --release      Build in release mode (optimized, default)"
            echo "  --cli          Build only lwas_cli"
            echo "  --core         Build only lwas_core"
            echo "  --parser       Build only lwas_parser"
            echo "  --skip-ui      Skip building Helios UI"
            echo "  --help         Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo ""
print_info "Build mode: $BUILD_MODE"
if [ -n "$BUILD_TARGET" ]; then
    print_info "Target: $BUILD_TARGET"
else
    print_info "Target: all workspace members"
fi
echo ""

# Build Rust components
echo "📦 Building Rust workspace..."
echo ""

if [ "$BUILD_MODE" = "release" ]; then
    CARGO_FLAGS="--release"
else
    CARGO_FLAGS=""
fi

if [ -n "$BUILD_TARGET" ]; then
    CARGO_FLAGS="$CARGO_FLAGS -p $BUILD_TARGET"
else
    CARGO_FLAGS="$CARGO_FLAGS --workspace"
fi

if cargo build $CARGO_FLAGS; then
    print_status "Rust build completed successfully"
    
    # Show build output
    if [ "$BUILD_MODE" = "release" ]; then
        BUILD_DIR="target/release"
    else
        BUILD_DIR="target/debug"
    fi
    
    echo ""
    echo "📊 Build artifacts:"
    if [ -f "$BUILD_DIR/lwas_cli" ]; then
        SIZE=$(du -h "$BUILD_DIR/lwas_cli" | cut -f1)
        print_status "lwas_cli: $SIZE"
    fi
else
    print_error "Rust build failed"
    exit 1
fi

# Build Helios UI
if [ "$SKIP_UI" = false ]; then
    echo ""
    echo "🎨 Building Helios UI..."
    echo ""
    
    if [ -d "helios-ui" ]; then
        cd helios-ui
        
        if ! command -v npm &> /dev/null; then
            print_error "npm not found. Skipping UI build."
            print_info "Install Node.js to build the UI: https://nodejs.org/"
        else
            print_info "Installing dependencies..."
            if npm install --silent; then
                print_status "Dependencies installed"
                
                print_info "Building frontend..."
                if npm run build; then
                    print_status "Helios UI build completed"
                else
                    print_error "Helios UI build failed"
                    cd ..
                    exit 1
                fi
            else
                print_error "npm install failed"
                cd ..
                exit 1
            fi
        fi
        
        cd ..
    else
        print_info "Helios UI directory not found, skipping"
    fi
fi

echo ""
echo "═══════════════════════════════════════"
print_status "Build completed successfully!"
echo "═══════════════════════════════════════"
echo ""

# Show next steps
echo "Next steps:"
if [ "$BUILD_MODE" = "release" ]; then
    echo "  • Run: ./target/release/lwas_cli ignite"
else
    echo "  • Run: ./target/debug/lwas_cli ignite"
fi
echo "  • Test: cargo test --workspace"
echo "  • Docker: docker build -t aeterna:latest ."
echo ""
