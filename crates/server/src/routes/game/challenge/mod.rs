use axum::{
    extract::{Query, State},
    middleware,
    response::IntoResponse,
    routing::{get, post},
    Extension, Json, Router,
};
use r2s_bucket::Bucket;
use r2s_database::{challenge, game, user::Permission};
use r2s_migrator::Database;
use sea_orm::TransactionTrait;
use serde::Deserialize;

use crate::{
    middleware::{
        auth::{self, Token},
        data,
    },
    traits::{GlobalState, ResponseError},
};

pub fn router(state: &GlobalState) -> Router<GlobalState> {
    Router::new()
        .route("/", post(create_challenge))
        .route_layer(middleware::from_fn_with_state(
            state.clone(),
            auth::game_admin_required,
        ))
        .route("/", get(get_challenge_list))
        .nest(
            "/:challenge",
            Router::new()
                // .route("/", patch(update_challenge).delete(delete_challenge))
                .route_layer(middleware::from_fn_with_state(
                    state.clone(),
                    auth::game_admin_required,
                ))
                .route("/", get(get_challenge))
                .layer(middleware::from_fn_with_state(
                    state.clone(),
                    data::prepare_data!(challenge, false),
                )),
        )
}

#[derive(Deserialize)]
struct ChallengeQuery {
    page: Option<u64>,
    page_size: Option<u64>,
    with_hidden: Option<bool>,
}

async fn get_challenge_list(
    State(ref db): State<Database>, Extension(game): Extension<game::Model>,
    Query(query): Query<ChallengeQuery>,
) -> Result<impl IntoResponse, ResponseError> {
    if query.page.is_none() || query.page_size.is_none() {
        let challenges =
            challenge::get_list(&db.conn, game.id, query.with_hidden.unwrap_or(false)).await?;
        return Ok(Json((challenges, 1)));
    }
    let page = query.page.unwrap_or(1);
    let page_size = query.page_size.unwrap_or(15);
    let with_hidden = query.with_hidden.unwrap_or(false);
    Ok(Json(
        challenge::get_page(&db.conn, page, page_size, game.id, with_hidden).await?,
    ))
}

async fn get_challenge(
    Extension(token): Extension<Token>, Extension(game): Extension<game::Model>,
    Extension(challenge): Extension<challenge::Model>,
) -> Result<impl IntoResponse, ResponseError> {
    if challenge.hidden
        && !(token.permissions.0.contains(&Permission::Game) && game.admins.0.contains(&token.id))
    {
        return Err(ResponseError::Forbidden(
            "permission denied".to_owned(),
            format!(
                "user {}:'{}' ({}) want to access hidden challenge {}:'{}'",
                token.id, token.account, token.nickname, challenge.id, challenge.name
            ),
        ));
    }
    if token.permissions.0.contains(&Permission::Game) && game.admins.0.contains(&token.id) {
        return Ok(Json(challenge));
    }
    Ok(Json(challenge.desensitize()))
}

async fn create_challenge(
    State(ref db): State<Database>, State(bucket): State<Bucket>,
    Extension(token): Extension<Token>, Extension(game): Extension<game::Model>,
    Json(challenge): Json<challenge::Model>,
) -> Result<impl IntoResponse, ResponseError> {
    let txn = db.conn.begin().await?;
    let challenge = challenge::create(
        &txn,
        challenge::Model {
            game_id: game.id,
            ..challenge
        },
    )
    .await?;
    let game_bucket = bucket
        .at_mut(
            game.bucket
                .ok_or(ResponseError::PreconditionFailed(format!(
                    "game {}:'{}' does not have a valid bucket",
                    game.id, game.name
                )))?,
        )
        .await?;
    game_bucket
        .create(serde_json::to_value(&challenge)?)
        .await?;
    game_bucket
        .take_shot(
            format!("create challenge {}", challenge.name),
            &token.account,
            format!("{}@private.ret.sh.cn", token.account),
        )
        .await?;
    txn.commit().await?;

    Ok(Json(challenge))
}
