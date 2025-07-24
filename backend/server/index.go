package server

import (
	"net/http"
	"time"

	"github.com/andi-frame/TeamName_KulkasKu/backend/config"
	"github.com/andi-frame/TeamName_KulkasKu/backend/controller"
	"github.com/andi-frame/TeamName_KulkasKu/backend/database"
	"github.com/andi-frame/TeamName_KulkasKu/backend/repository"
	"github.com/andi-frame/TeamName_KulkasKu/backend/routes"
	"github.com/andi-frame/TeamName_KulkasKu/backend/service"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func (s *Server) RegisterRoutes() http.Handler {

	cfg := config.LoadConfig()

	r := gin.Default()
	r.RedirectTrailingSlash = false

	r.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.AllowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Accept", "Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Set-Cookie"},
		AllowCredentials: true, // Enable cookies/auth
		MaxAge:           24 * time.Hour,
	}))

	// Default routes
	r.GET("/", s.HelloWorldHandler)
	r.GET("/health", s.healthHandler)

	// Routes
	routes.AuthRoute(r, cfg)
	routes.PredictionRoute(r, cfg)
	routes.ProductRoute(r, cfg)
	routes.ReceiptRoute(r, cfg)
	routes.RecipeRoute(r, cfg)
	routes.ItemRoute(r, cfg)

	// Recommendation route setup
	recRepository := repository.NewRecommendationRepository(database.DB)
	recService := service.NewRecommendationService(recRepository)
	recController := controller.NewRecommendationController(recService)
	routes.RecommendationRoute(r, recController)

	return r
}

func (s *Server) HelloWorldHandler(c *gin.Context) {
	resp := make(map[string]string)
	resp["message"] = "Hello World"

	c.JSON(http.StatusOK, resp)
}

func (s *Server) healthHandler(c *gin.Context) {
	resp := make(map[string]string)
	resp["message"] = "All Good"
	c.JSON(http.StatusOK, resp)
}
