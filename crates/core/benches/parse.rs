use criterion::{Criterion, Throughput, criterion_group, criterion_main};
use oss_core::parse_setting;
use std::hint::black_box;

fn bench_parse(c: &mut Criterion) {
    let mut group = c.benchmark_group("parse_setting");
    group.throughput(Throughput::Bytes(14));
    group.bench_function("typical-line", |b| {
        b.iter(|| parse_setting(black_box("timeout = 30")).unwrap())
    });
    group.finish();
}

criterion_group!(benches, bench_parse);
criterion_main!(benches);
