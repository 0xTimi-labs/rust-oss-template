//! 集成测试：从使用者视角验证公开 API。

use oss_core::{ParseError, parse_setting};

#[test]
fn tolerates_surrounding_whitespace() {
    assert_eq!(parse_setting("  key =  -1  "), Ok(("key".into(), -1)));
}

#[test]
fn error_types_are_comparable() {
    assert_ne!(ParseError::EmptyName, ParseError::InvalidValue);
}
