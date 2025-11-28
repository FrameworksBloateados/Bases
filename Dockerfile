FROM oven/bun:1
WORKDIR /usr/src/app

USER root
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      git \
      wget \
      ca-certificates \
      gnupg \
      procps \
    && rm -rf /var/lib/apt/lists/*

USER bun

EXPOSE 80
EXPOSE 3000
CMD ["sleep", "infinity"]
