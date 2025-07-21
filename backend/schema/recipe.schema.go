package schema

type Author struct {
	ID          string `json:"id"`
	UUID        string `json:"uuid"`
	Username    string `json:"username"`
	Name        string `json:"name"`
	Avatar      string `json:"avatar"`
	IsFollowing bool   `json:"is_following"`
	IsOfficial  bool   `json:"is_official"`
}

type Tag struct {
	Name string `json:"name"`
	Slug string `json:"slug"`
}

type Category struct {
	Name string `json:"name"`
	Slug string `json:"slug"`
}

type Recook struct {
	RecookCount int   `json:"recook_count"`
	RecookList  []any `json:"recook_list"`
}

type Recipe struct {
	ID             string    `json:"id"`
	Title          string    `json:"title"`
	Slug           string    `json:"slug"`
	CoverURL       string    `json:"cover_url"`
	Rating         float64   `json:"rating"`
	CookingTime    int       `json:"cooking_time"`
	Calories       string    `json:"calories"`
	ReleaseDate    int64     `json:"release_date"`
	IsEditorial    bool      `json:"is_editorial"`
	StepCount      int       `json:"step_count"`
	PremiumContent bool      `json:"premium_content"`
	VisitedCount   int       `json:"visited_count"`
	IsBookmark     bool      `json:"is_bookmark"`
	UpdatedAt      int64     `json:"updated_at"`
	Subcategory    string    `json:"subcategory"`
	Price          int       `json:"price"`
	Author         *Author   `json:"author"`
	Recook         Recook    `json:"recook"`
	Category       *Category `json:"category"`
	Tags           []Tag     `json:"tags"`
}

type RecipeListResponse struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
	Data    struct {
		ResultCount int      `json:"result_count"`
		Result      []Recipe `json:"result"`
	} `json:"data"`
}
