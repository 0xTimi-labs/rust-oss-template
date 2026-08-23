//! 集成测试：从使用者视角验证公开 API。

use oss_core::{ParseError, Setting, parse_setting};

#[test]
fn tolerates_surrounding_whitespace() {
    assert_eq!(
        parse_setting("  key =  -1  "),
        Ok(Setting {
            name: "key".into(),
            value: -1
        })
    );
}

#[test]
fn error_types_are_comparable() {
    assert_ne!(ParseError::EmptyName, ParseError::InvalidValue);
}

#[test]
fn parse_setting_reports_documented_error_variants() {
    assert_eq!(parse_setting("key"), Err(ParseError::MissingSeparator));
    assert_eq!(parse_setting("= 1"), Err(ParseError::EmptyName));
    assert_eq!(parse_setting("key = abc"), Err(ParseError::InvalidValue));
}
