mod challenge;
mod notification;
mod submission;
mod team;
mod writeup;

use axum::Router;

use crate::controller::GlobalState;

pub fn router() -> Router<GlobalState> {
    Router::new().nest(
        "/:game_id",
        Router::new().nest("/challenge", challenge::router()),
    )
}
