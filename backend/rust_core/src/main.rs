use rust_core::server::run_server;

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    run_server().await
}
