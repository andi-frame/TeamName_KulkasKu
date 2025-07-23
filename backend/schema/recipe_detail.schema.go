package schema

type CookingStep struct {
	Title         string `json:"title"`
	Text          string `json:"text"`
	ImageURL      string `json:"image_url"`
	Order         int    `json:"order"`
	StartAt       int    `json:"start_at"`
	OriginalImage string `json:"original_image"`
}

type Ingredient struct {
	Description           string `json:"description"`
	Recommendation        string `json:"recommendation"`
	Brand                 string `json:"brand"`
	BuyURL                string `json:"buy_url"`
	MediaURL              string `json:"media_url"`
	RecomendationMediaURL string `json:"recomendation_media_url"`
	RelatedRecipe         any    `json:"related_recipe"`
}

type IngredientType struct {
	Name        string       `json:"name"`
	Ingredients []Ingredient `json:"ingredients"`
}

type RecipeDetail struct {
	ID              string           `json:"id"`
	Title           string           `json:"title"`
	Slug            string           `json:"slug"`
	CoverURL        string           `json:"cover_url"`
	CoverWatermark  string           `json:"cover_url_watermark"`
	Description     string           `json:"description"`
	Rating          float64          `json:"rating"`
	VideoURL        string           `json:"video_url"`
	Price           int              `json:"price"`
	PricePremium    int              `json:"price_premium"`
	Calories        string           `json:"calories"`
	IsCVC           bool             `json:"is_cvc"`
	CookingTime     int              `json:"cooking_time"`
	ServingMin      int              `json:"serving_min"`
	ServingMax      int              `json:"serving_max"`
	ReleaseDate     int64            `json:"release_date"`
	UpdatedDate     int64            `json:"updated_date"`
	IsBookmark      bool             `json:"is_bookmark"`
	IsEditorial     bool             `json:"is_editorial"`
	RatingUser      float64          `json:"rating_user"`
	IsVideo         bool             `json:"is_video"`
	PremiumContent  bool             `json:"premium_content"`
	BrandSlug       string           `json:"brand_slug"`
	IngredientCount int              `json:"ingredient_count"`
	MetaTitle       string           `json:"meta_title"`
	MetaDescription string           `json:"meta_description"`
	OGCaption       string           `json:"og_caption"`
	OGTitle         string           `json:"og_title"`
	OGDescription   string           `json:"og_description"`
	OGMedia         string           `json:"og_media"`
	RaterCount      int              `json:"rater_count"`
	RecookCount     int              `json:"recook_count"`
	OriginalImage   string           `json:"original_image"`
	ShareLink       string           `json:"share_link"`
	Category        Category         `json:"category"`
	CookingStep     []CookingStep    `json:"cooking_step"`
	Tags            []Tag            `json:"tags"`
	TagIngredients  []Tag            `json:"tag_ingredients"`
	RecipeInfo      []any            `json:"recipe_info"`
	Author          Author           `json:"author"`
	IngredientType  []IngredientType `json:"ingredient_type"`
	Nutrition       []any            `json:"nutrition"`
	Recook          []any            `json:"recook"`
	CookingTool     []any            `json:"cooking_tool"`
	TipsAndTrick    []any            `json:"tips_and_trick"`
	PurchaseDetail  []any            `json:"purchase_detail"`
}

type RecipeDetailResponse struct {
	Status  int          `json:"status"`
	Message string       `json:"message"`
	Data    RecipeDetail `json:"data"`
}
