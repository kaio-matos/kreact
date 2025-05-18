FROM node:20

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
RUN apt-get update; apt-get install -y fontconfig
RUN fc-cache -f -v

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
CMD [ "cat" ]
