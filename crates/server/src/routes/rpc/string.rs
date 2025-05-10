use axum::{Router, extract::Query, response::IntoResponse, routing::get};
use deunicode::deunicode_with_tofu;
use heck::ToSnakeCase;
use serde::Deserialize;

use crate::{
  traits::{GlobalState, ResponseError},
  utility::string::leet_str,
};

pub fn router(_state: &GlobalState) -> Router<GlobalState> {
  Router::new()
    .route("/deunicode", get(generate_deunicode))
    .route("/leet", get(generate_leet))
}

#[derive(Deserialize)]
struct GenericQuery {
  text: String,
  keep_case: Option<bool>,
}

async fn generate_deunicode(
  Query(query): Query<GenericQuery>,
) -> Result<impl IntoResponse, ResponseError> {
  let result = deunicode_with_tofu(&query.text.replace(" ", "_"), "_")
    .trim()
    .to_owned();
  if query.keep_case.unwrap_or(false) {
    Ok(result.replace(" ", ""))
  } else {
    Ok(result.to_snake_case())
  }
}

async fn generate_leet(
  Query(query): Query<GenericQuery>,
) -> Result<impl IntoResponse, ResponseError> {
  Ok(leet_str(query.text))
}
