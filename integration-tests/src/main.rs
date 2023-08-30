fn main() {
    env_logger::init();
    println!("> found openvino version: {}", openvino::version());
}
