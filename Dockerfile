FROM oven/bun:1
WORKDIR /usr/src/app

USER root
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

USER bun
EXPOSE 80/tcp
EXPOSE 3000/tcp
CMD ["sleep", "infinity"]
