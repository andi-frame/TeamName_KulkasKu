package server

import (
	"log"
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

	// Services
	geminiService, err := service.NewGeminiService()
	if err != nil {
		log.Fatalf("Failed to create Gemini service: %v", err)
	}
	recipeService := service.NewRecipeService(geminiService, database.DB)
	activityService := service.NewActivityService()

	// Controllers
	recipeController := controller.NewRecipeController(recipeService)
	activityController := controller.NewActivityController(activityService)

	// Routes
	routes.AuthRoute(r, cfg)
	routes.PredictionRoute(r, cfg)
	routes.ProductRoute(r, cfg)
	routes.ReceiptRoute(r, geminiService)
	routes.RecipeRoute(r, recipeController)
	routes.ItemRoute(r, cfg)
	routes.CartRoute(r, cfg)
	routes.UserPreferenceRoute(r)
	routes.ActivityRoute(r, activityController)

	// Food Journal route setup
	foodJournalRepository := repository.NewFoodJournalRepository(database.DB)
	foodJournalService := service.NewFoodJournalService(foodJournalRepository, geminiService)
	foodJournalController := controller.NewFoodJournalController(foodJournalService)
	routes.FoodJournalRoutes(r, foodJournalController)

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