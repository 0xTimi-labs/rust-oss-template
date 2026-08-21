//! 核心逻辑库。

/// 解析 "名称=数值" 格式的配置行。
///
/// # Errors
/// 输入缺少 `=`、名称为空或数值不是合法 i64 时返回错误。
pub fn parse_setting(input: &str) -> Result<(String, i64), ParseError> {
    let (name, value) = input.split_once('=').ok_or(ParseError::MissingSeparator)?;
    let name = name.trim();
    if name.is_empty() {
        return Err(ParseError::EmptyName);
    }
    let value: i64 = value.trim().parse().map_err(|_| ParseError::InvalidValue)?;
    Ok((name.to_owned(), value))
}

/// 解析失败的原因。
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ParseError {
    MissingSeparator,
    EmptyName,
    InvalidValue,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn 正常解析() {
        assert_eq!(parse_setting("timeout = 30"), Ok(("timeout".into(), 30)));
    }

    #[test]
    fn 缺少分隔符时报错() {
        assert_eq!(
            parse_setting("timeout 30"),
            Err(ParseError::MissingSeparator)
        );
    }

    #[test]
    fn 名称为空时报错() {
        assert_eq!(parse_setting("= 42"), Err(ParseError::EmptyName));
    }

    #[test]
    fn 数值非法时报错() {
        assert_eq!(
            parse_setting("timeout = abc"),
            Err(ParseError::InvalidValue)
        );
    }
}
