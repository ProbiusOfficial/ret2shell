//! # Feature Traits
//!
//! Our challenge is managed by traits, which is defined in this module.
//!
//! A feature should have:
//!
//! - Build action: build the challenge when user update the repo.
//! - Static info: the static info of the challenge, the same to everyone.
//! - Dynamic info: the dynamic info of the challenge, different to everyone.
//! - Checker: check the flag.

pub trait FeatureTrait {}
