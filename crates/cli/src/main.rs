use clap::Parser;

/// rust-oss-template 命令行入口。
#[derive(Parser)]
#[command(version, about)]
struct Args {
    /// 按 "名称=数值" 格式解析的配置行
    settings: Vec<String>,
}

fn main() {
    let args = Args::parse();
    for input in &args.settings {
        match oss_core::parse_setting(input) {
            Ok(setting) => println!("{} = {}", setting.name, setting.value),
            Err(err) => {
                eprintln!("解析失败: {input:?} ({err})");
                std::process::exit(1);
            }
        }
    }
}
