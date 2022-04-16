package main

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
)

type requestData struct {
	Data interface{} `json:"data"`
}

func (r requestData) String() string {
	return fmt.Sprintf("%v", r.Data)
}

func (r requestData) ToJSON() []byte {
	byteJson, _ := json.Marshal(r.Data)
	return byteJson
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
	_, existsProdMod := os.LookupEnv("PROD")
	if existsProdMod {
		gin.SetMode(gin.ReleaseMode)
	}
	redisHost, existsRedisHost := os.LookupEnv("REDIS_SERVICE_SERVICE_HOST")
	if !existsRedisHost {
		redisHost = "localhost"
	}
	redisPort, existsRedisPort := os.LookupEnv("REDIS_SERVICE_SERVICE_PORT")
	if !existsRedisPort {
		redisPort = "6379"
	}

	
	rand.Seed(time.Now().UnixNano())
	server := gin.Default()
	redis := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%v:%v", redisHost, redisPort),
		Password: "",
		DB:       0,
		PoolSize: 1000,
	})

	fmt.Printf("redis %v:%v", redisHost, redisPort)
	server.GET("/aiservice/request/:modelId", func(ctx *gin.Context) {
		start := time.Now()
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
			body.ToJSON(),
		)

		responseStr, error := redis.BLPop(
			goContext,
			20*time.Second,
			fmt.Sprintf("response-%s-%s", requestId, modelId),
		).Result()

		duration := time.Since(start)
		if error != nil {
			fmt.Println(error.Error())
			ctx.JSON(http.StatusInternalServerError, map[string]interface{}{
				"data":   body.Data,
				"error": "internal error",
				"status": http.StatusInternalServerError,
				"time": fmt.Sprint(duration.Seconds()),
			})
		} else {
			var response map[string]interface{}
			json.Unmarshal([]byte(responseStr[1]), &response)
			fmt.Println(response)
			switch response["status"] {
			case "ok":
				ctx.JSON(http.StatusOK, map[string]interface{}{
					"data":   body.Data,
					"response": response["prediction"],
					"status":  http.StatusOK,
					"time": fmt.Sprint(duration.Seconds()),
					"execution time": response["time"],
				})
			case "error":
				ctx.JSON(http.StatusOK, map[string]interface{}{
					"data":   body.Data,
					"error": response["error"],
					"status":  http.StatusBadRequest,
					"time": fmt.Sprint(duration.Seconds()),
					"execution time": response["time"],
				})
			}
			
		}
	})

	if existsProdMod {
		server.Run(":3000")
	}else{
		server.Run("127.0.0.1:3000")
	}
}
