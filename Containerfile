FROM rust:1-alpine as builder

# hadolint ignore=DL3018
RUN apk add --update --no-cache musl-dev

COPY ./config /app/config
COPY ./Cargo.toml /app/Cargo.toml
COPY ./crates /app/crates
WORKDIR /app

RUN cargo build --release --target x86_64-unknown-linux-musl

FROM alpine:3

# hadolint ignore=DL3018
RUN apk add --update --no-cache curl git skopeo && \
    git config --global user.email platform@ret.sh.cn && \
    git config --global user.name Ret2Shell

COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/r2s-server /bin/r2s-server

ENTRYPOINT ["/bin/r2s-server"]

