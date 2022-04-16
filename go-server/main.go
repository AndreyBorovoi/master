package main

import (
	"context"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"math/rand"
	"net/http"
	"time"
)

type requestData struct {
	Data []interface{} `json:"data"`
}

func (r requestData) String() string {
	return fmt.Sprintf("%v", r.Data)
}

func generateRequestId() string {
	symbols := []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890")
	modelId := make([]rune, 10)
	for i := 0; i < 10; i++ {
		modelId[i] = symbols[rand.Intn(len(symbols))]
	}
	return string(modelId)
}

func main() {
	var goContext = context.Background()
	// gin.SetMode(gin.ReleaseMode)
	rand.Seed(time.Now().UnixNano())
	server := gin.Default()
	redis := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "",
		DB:       0,
		PoolSize: 1000,
	})

	server.GET("/:modelId", func(ctx *gin.Context) {
		var body requestData
		ctx.BindJSON(&body)
		modelId := ctx.Param("modelId")
		requestId := generateRequestId()

		redis.LPush(
			goContext,
			fmt.Sprintf("requests-%s", modelId),
			requestId,
		)

		redis.LPush(
			goContext,
			fmt.Sprintf("request-%s-%s", requestId, modelId),
			body.String(),
		)

		response, error := redis.BLPop(
			goContext,
			20*time.Second,
			fmt.Sprintf("response-%s-%s", requestId, modelId),
		).Result()

		if error != nil {
			fmt.Println(error.Error())
			ctx.JSON(http.StatusInternalServerError, map[string]interface{}{
				"data":   body.String(),
				"status": http.StatusInternalServerError,
			})
		} else {
			ctx.JSON(http.StatusOK, map[string]interface{}{
				"modelId": response,
				"status":  http.StatusOK,
			})
		}
	})

	server.Run("127.0.0.1:3000")

}
