use super::GlobalState;
use axum::Router;

mod answer;
mod repo;
mod submission;
mod workflow;
mod traffic;

pub fn router() -> Router<GlobalState> {
    Router::new()
}
