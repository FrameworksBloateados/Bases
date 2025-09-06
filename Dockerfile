FROM oven/bun:1
WORKDIR /usr/src/app

USER bun
EXPOSE 3000/tcp
EXPOSE 4000/tcp
CMD ["sleep", "infinity"]
