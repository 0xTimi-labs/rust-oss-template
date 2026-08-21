//! 集成测试：从使用者视角验证公开 API。

use oss_core::{ParseError, parse_setting};

#[test]
fn 宽松空白也能解析() {
    assert_eq!(parse_setting("  key =  -1  "), Ok(("key".into(), -1)));
}

#[test]
fn 错误类型可比较() {
    assert_ne!(ParseError::EmptyName, ParseError::InvalidValue);
}
