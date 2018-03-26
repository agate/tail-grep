FROM alpine:3.7

RUN apk update && \
    apk add yarn 'nodejs>8' 'nodejs<9' && \
    rm -rf /var/cache/apk/*

ADD . /app
WORKDIR /app
RUN yarn install

EXPOSE 3000

ENTRYPOINT ["/sbin/init"]
CMD ["npm", "run", "prod"]
