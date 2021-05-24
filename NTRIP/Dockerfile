FROM gcc:4.9 as builder
COPY . .
# RUN gcc -o ntripserver hello.c
RUN make

FROM alpine:latest
WORKDIR /app
COPY --from=builder ntripserver /app
COPY --from=builder startntripserver.sh /app
ENTRYPOINT ["/bin/bash","./startntripserver.sh"]
