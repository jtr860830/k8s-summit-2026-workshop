# Minimal runtime image: a statically linked binary on scratch.
# Build the binary first:
#   CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o build/inplace-update .
FROM scratch
COPY inplace-update /inplace-update
ENTRYPOINT ["/inplace-update"]
