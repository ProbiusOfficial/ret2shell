use axum::{extract::State, middleware, response::IntoResponse, routing::get, Json, Router};
use r2s_cluster::Cluster;
use r2s_database::user::Permission;
use tracing::{debug, error};

use crate::{
  middleware::auth,
  traits::{GlobalState, ResponseError},
};

pub fn router(state: &GlobalState) -> Router<GlobalState> {
  if state.config.cluster.as_ref().is_some_and(|c| c.enabled) {
    let cluster = state.cluster.clone();
    tokio::spawn(cluster_maintain_worker(cluster));
  }
  Router::new()
    .route("/config", get(get_cluster_config))
    .route("/nodes", get(get_cluster_nodes))
    .route_layer(middleware::from_fn(auth::permission_required_all!(
      Permission::DevOps
    )))
    .route_layer(middleware::from_fn(auth::permission_required_all!(
      Permission::Basic,
      Permission::Verified
    )))
}

async fn cluster_maintain_worker(cluster: Cluster) {
  loop {
    tokio::time::sleep(std::time::Duration::from_secs(60)).await;
    debug!("Checking outdated pods...");
    if let Err(e) = cluster.delete_outdated_pods().await {
      error!("Failed to delete outdated pods: {}", e);
    }
  }
}

async fn get_cluster_config(
  State(ref cluster): State<Cluster>,
) -> Result<impl IntoResponse, ResponseError> {
  let configs = cluster.configs().await?;
  Ok(Json(configs))
}

async fn get_cluster_nodes(
  State(ref cluster): State<Cluster>,
) -> Result<impl IntoResponse, ResponseError> {
  let nodes = cluster.nodes().await?;
  Ok(Json(nodes))
}
