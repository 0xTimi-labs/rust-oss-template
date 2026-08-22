use clap::Parser;
use std::io::{self, Write};
use std::process::ExitCode;

/// rust-oss-template 命令行入口。
#[derive(Parser)]
#[command(version, about)]
struct Args {
    /// 按 "名称=数值" 格式解析的配置行
    settings: Vec<String>,
}

fn main() -> ExitCode {
    let args = Args::parse();
    match run(&args) {
        Ok(()) => ExitCode::SUCCESS,
        // 下游管道关闭（如 `| head`）属正常退出，不按错误处理
        Err(err) if err.kind() == io::ErrorKind::BrokenPipe => ExitCode::SUCCESS,
        Err(err) => {
            eprintln!("错误: {err}");
            ExitCode::FAILURE
        }
    }
}

/// 独立于 main 的执行入口，便于集成测试直接断言行为。
fn run(args: &Args) -> io::Result<()> {
    let mut stdout = io::stdout().lock();
    for input in &args.settings {
        let setting = oss_core::parse_setting(input)
            .map_err(|err| io::Error::new(io::ErrorKind::InvalidData, err))?;
        writeln!(stdout, "{} = {}", setting.name, setting.value)?;
    }
    Ok(())
}
