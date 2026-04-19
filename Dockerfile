FROM golang:alpine AS builder

# Pure-Go SQLite (modernc.org/sqlite) — no CGO, no gcc needed
COPY . /src
RUN cd /src/cmd/ExerciseDiary/ && \
    CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-w -s" \
    -o /ExerciseDiary .


FROM alpine:3.21

# TLS root certificates (for outbound HTTPS if ever needed)
RUN apk add --no-cache ca-certificates tzdata \
    && addgroup -S app && adduser -S -G app app

WORKDIR /app
COPY --from=builder /ExerciseDiary /app/

# Data directory — mount a volume here
RUN mkdir -p /data/ExerciseDiary && chown app:app /data/ExerciseDiary

USER app
EXPOSE 8851

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:8851/ || exit 1

ENTRYPOINT ["/app/ExerciseDiary"]