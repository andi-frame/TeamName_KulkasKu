package server

import (
	"net/http"

	"github.com/andi-frame/TeamName_KulkasKu/backend/config"
	"github.com/andi-frame/TeamName_KulkasKu/backend/routes"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func (s *Server) RegisterRoutes() http.Handler {

	cfg := config.LoadConfig()

	r := gin.Default()
	r.RedirectTrailingSlash = false

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true, // Enable cookies/auth
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
