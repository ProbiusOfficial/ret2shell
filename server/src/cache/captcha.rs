use super::manager::{PoolLike, PooledConnectionLike, RedisPool};

pub struct Captcha;

impl Captcha {
    pub async fn store(conn: &mut RedisPool, id: &str, criteria: &str) -> anyhow::Result<()> {
        let mut conn = conn.get().await?;
        conn.pset_ex(format!("captcha:{}", id), criteria, 5 * 60 * 1000)
            .await?;
        Ok(())
    }

    pub async fn get(conn: &mut RedisPool, id: &str) -> anyhow::Result<String> {
        let mut conn = conn.get().await?;
        let criteria: String = conn.get(format!("captcha:{}", id)).await?;
        Ok(criteria)
    }
}
