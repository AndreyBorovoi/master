FROM golang:1.18-alpine

ENV PROD=true

WORKDIR /app

COPY . .

RUN go mod download
RUN go build -o /go-server

EXPOSE 3000

CMD ["/go-server"]

