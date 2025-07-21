"use client";

import { useRecipeStore } from "@/store/useRecipeStore";
import { Recipe } from "@/types/recipe.types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

type Props = {
  recipe: Recipe;
};

// TODO: implement call for real price
const RecipeCard: React.FC<Props> = ({ recipe }) => {
  const router = useRouter();
  const { setRecipeDetail } = useRecipeStore();

  const handleRecipeOnClick = () => {
    setRecipeDetail(data);
    router.push("/recipe/detail");
  };

  return (
    <div className="rounded p-4 shadow max-w-sm" onClick={handleRecipeOnClick}>
      <Image
        src={`https://cdn.yummy.co.id/${recipe.cover_url}`}
        height={100}
        width={100}
        alt={recipe.title}
        className="w-full h-28 object-cover rounded"
      />
      <h2 className="text-xs font-bold mt-2">{recipe.title}</h2>
      <p className="text-[9px] text-gray-600">By {recipe.author.name}</p>
      <p className="text-[9px] text-gray-600">
        ⭐ {recipe.rating}
        {data.price > 0 ? ` • 💰 ${data.price / 1000}K` : ""} • ⏱️ {recipe.cooking_time} min
      </p>
    </div>
  );
};

export default RecipeCard;

const data = {
  id: "fvVJJeZ88rqL9TBHgJzTKw==",
  title: "Ayam Goreng Ketumbar Lada Hitam",
  slug: "ayam-goreng-ketumbar-lada-hitam",
  cover_url:
    "content-images/images/20240102/z6gJzvjidUqALVNz7X96z09c7KQlBbbP-31373034323038323430d41d8cd98f00b204e9800998ecf8427e.jpg?x-oss-process=image/format,webp",
  cover_url_watermark:
    "content-images/images/20240102/z6gJzvjidUqALVNz7X96z09c7KQlBbbP-31373034323038323430d41d8cd98f00b204e9800998ecf8427e.jpg?x-oss-process=image/resize,w_600,h_315,m_fill,image/watermark,image_Y29udGVudC1pbWFnZXMvaW1hZ2VzLzIwMjMwNzMxL3dhdGVybWFyay1hcnRpY2xlLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSxQXzEwMA==,g_south,y_0",
  description: "Rasanya yummy banget, kriuk-kriuk bumbunya.\r\nInspirasi resep dari Chef Laila Dawud.",
  rating: 5,
  video_url: "",
  price: 25000,
  price_premium: 0,
  calories: "",
  is_cvc: false,
  cooking_time: 35,
  serving_min: 3,
  serving_max: 6,
  release_date: 1706319660,
  updated_date: 1706460033,
  is_bookmark: false,
  is_editorial: false,
  rating_user: 5,
  is_video: false,
  premium_content: false,
  brand_slug: "",
  ingredient_count: 14,
  meta_title: "",
  meta_description: "",
  og_caption: "",
  og_title: "",
  og_description: "",
  og_media: "",
  rater_count: 1,
  recook_count: 0,
  original_image:
    "content-images/images/20240102/z6gJzvjidUqALVNz7X96z09c7KQlBbbP-31373034323038323430d41d8cd98f00b204e9800998ecf8427e.jpg?x-oss-process=image/resize,w_800,h_800,m_fixed",
  share_link: "https://app.yummy.co.id/3fLxm5ke57LutfxX8",
  category: {
    name: "",
    slug: "",
  },
  cooking_step: [
    {
      title: "Langkah 1",
      text: "Cuci bersih ayam.",
      image_url:
        "content-images/images/20240102/rJI7WQ64gRQ6NpgjZ1jCLFGvBeP50emR-31373034323039353936d41d8cd98f00b204e9800998ecf8427e.jpg?x-oss-process=image/resize,w_600,h_600,m_fixed,image/format,webp",
      order: 1,
      start_at: 0,
      original_image:
        "content-images/images/20240102/rJI7WQ64gRQ6NpgjZ1jCLFGvBeP50emR-31373034323039353936d41d8cd98f00b204e9800998ecf8427e.jpg?x-oss-process=image/format,webp",
    },
    {
      title: "Langkah 2",
      text: "Campur ayam dengan bumbu marinasi (kecuali tepung terigu).",
      image_url:
        "content-images/images/20240102/X7exMbYf2SEdKyQ5251zdpmsoUOsTb4m-31373034323039363134d41d8cd98f00b204e9800998ecf8427e.jpg?x-oss-process=image/resize,w_600,h_600,m_fixed,image/format,webp",
      order: 2,
      start_at: 0,
      original_image:
        "content-images/images/20240102/X7exMbYf2SEdKyQ5251zdpmsoUOsTb4m-31373034323039363134d41d8cd98f00b204e9800998ecf8427e.jpg?x-oss-process=image/format,webp",
    },
    {
      title: "Langkah 3",
      text: "Tambahkan bumbu halus, baluri ayam hingga tercampur rata.",
      image_url:
        "content-images/images/20240102/mbUZOWeaZsjah48Y00X7MW8kh96HZMgq-31373034323039363635d41d8cd98f00b204e9800998ecf8427e.jpg?x-oss-process=image/resize,w_600,h_600,m_fixed,image/format,webp",
      order: 3,
      start_at: 0,
      original_image:
        "content-images/images/20240102/mbUZOWeaZsjah48Y00X7MW8kh96HZMgq-31373034323039363635d41d8cd98f00b204e9800998ecf8427e.jpg?x-oss-process=image/format,webp",
    },
    {
      title: "Langkah 4",
      text: "Tambahkan tepung terigu, aduk kembali.",
      image_url:
        "content-images/images/20240102/B4krq4TSum5x2988UmlUOPEHm52P5bTc-31373034323039363936d41d8cd98f00b204e9800998ecf8427e.jpg?x-oss-process=image/resize,w_600,h_600,m_fixed,image/format,webp",
      order: 4,
      start_at: 0,
      original_image:
        "content-images/images/20240102/B4krq4TSum5x2988UmlUOPEHm52P5bTc-31373034323039363936d41d8cd98f00b204e9800998ecf8427e.jpg?x-oss-process=image/format,webp",
    },
    {
      title: "Langkah 5",
      text: "Diamkan ayam dalam suhu ruang selama 30 menit supaya bumbu meresap.",
      image_url:
        "content-images/images/20240102/Ru97QMdyxhtR8pszoS8YQkcb2RS9Stl8-31373034323039373232d41d8cd98f00b204e9800998ecf8427e.jpg?x-oss-process=image/resize,w_600,h_600,m_fixed,image/format,webp",
      order: 5,
      start_at: 0,
      original_image:
        "content-images/images/20240102/Ru97QMdyxhtR8pszoS8YQkcb2RS9Stl8-31373034323039373232d41d8cd98f00b204e9800998ecf8427e.jpg?x-oss-process=image/format,webp",
    },
    {
      title: "Langkah 6",
      text: "Panaskan minyak, goreng ayam hingga matang.",
      image_url:
        "content-images/images/20240102/MEKBlrLu6i2Y2gHYMwUsnYQVQ48SFSwB-31373034323039373932d41d8cd98f00b204e9800998ecf8427e.jpg?x-oss-process=image/resize,w_600,h_600,m_fixed,image/format,webp",
      order: 6,
      start_at: 0,
      original_image:
        "content-images/images/20240102/MEKBlrLu6i2Y2gHYMwUsnYQVQ48SFSwB-31373034323039373932d41d8cd98f00b204e9800998ecf8427e.jpg?x-oss-process=image/format,webp",
    },
    {
      title: "Langkah 7",
      text: "Angkat ayam dan tiriskan.",
      image_url:
        "content-images/images/20240102/aA29go7gsx5mt1e1BsMWxqSn5y5PH7ok-31373034323039383135d41d8cd98f00b204e9800998ecf8427e.jpg?x-oss-process=image/resize,w_600,h_600,m_fixed,image/format,webp",
      order: 7,
      start_at: 0,
      original_image:
        "content-images/images/20240102/aA29go7gsx5mt1e1BsMWxqSn5y5PH7ok-31373034323039383135d41d8cd98f00b204e9800998ecf8427e.jpg?x-oss-process=image/format,webp",
    },
  ],
  tags: [
    {
      id: "6aBOthKNa-VwyAhY6H31dA==",
      name: "Makanan Utama",
      slug: "makanan-utama",
    },
    {
      id: "XPiIeXTytIkJa_n6ueUNAg==",
      name: "Makanan Indonesia",
      slug: "makanan-indonesia",
    },
    {
      id: "eSjxzes6JPu0bFRNSnMkqg==",
      name: "Makanan Anak Kost",
      slug: "makanan-anak-kost",
    },
  ],
  tag_ingredients: [
    {
      id: "Lhi3GDcz26NnsIHt9zeeMA==",
      name: "Ayam",
      slug: "ayam",
    },
    {
      id: "oZ6d0F6WiXHtgy42qMUAUQ==",
      name: "Ketumbar",
      slug: "ketumbar",
    },
    {
      id: "CtwzKFqwt2hHez6OjZb2bw==",
      name: "Lada",
      slug: "lada",
    },
  ],
  recipe_info: [],
  author: {
    id: "Dj9Fs92z13dtucDql9mP-A==",
    uuid: "2824ebcc-8ea1-4a7c-93d2-989872ad584b",
    username: "diana-nurjanah",
    name: "Diana Nurjanah ",
    avatar:
      "content-images/images/20201122/JQRmh4jJxeheD27ne1L64mkA1QonHy31-31363036303131303436d41d8cd98f00b204e9800998ecf8427e.jpg?x-oss-process=image/resize,w_200,h_200,m_fixed,image/format,webp",
    is_following: false,
    is_official: false,
  },
  ingredient_type: [
    {
      name: "Bahan Utama",
      ingredients: [
        {
          description: "6 sayap ayam",
          recommendation: "",
          brand: "",
          buy_url: "",
          media_url: "",
          recomendation_media_url: "",
          related_recipe: null,
        },
        {
          description: "Secukupnya minyak goreng",
          recommendation: "",
          brand: "",
          buy_url: "",
          media_url: "",
          recomendation_media_url: "",
          related_recipe: null,
        },
      ],
    },
    {
      name: "Bumbu Marinasi:",
      ingredients: [
        {
          description: "2 sdm ketumbar bubuk, sangrai",
          recommendation: "",
          brand: "",
          buy_url: "",
          media_url: "",
          recomendation_media_url: "",
          related_recipe: null,
        },
        {
          description: "½ sdt garam",
          recommendation: "",
          brand: "",
          buy_url: "",
          media_url: "",
          recomendation_media_url: "",
          related_recipe: null,
        },
        {
          description: "½ sdt kaldu bubuk",
          recommendation: "",
          brand: "",
          buy_url: "",
          media_url: "",
          recomendation_media_url: "",
          related_recipe: null,
        },
        {
          description: "½ sdt lada Hitam",
          recommendation: "",
          brand: "",
          buy_url: "",
          media_url: "",
          recomendation_media_url: "",
          related_recipe: null,
        },
        {
          description: "50 ml air mineral",
          recommendation: "",
          brand: "",
          buy_url: "",
          media_url: "",
          recomendation_media_url: "",
          related_recipe: null,
        },
        {
          description: "3 sdm tepung terigu protein rendah",
          recommendation: "",
          brand: "",
          buy_url: "",
          media_url: "",
          recomendation_media_url: "",
          related_recipe: null,
        },
      ],
    },
    {
      name: "Bumbu Halus:",
      ingredients: [
        {
          description: "4 siung bawang merah",
          recommendation: "",
          brand: "",
          buy_url: "",
          media_url: "",
          recomendation_media_url: "",
          related_recipe: null,
        },
        {
          description: "3 siung bawang putih",
          recommendation: "",
          brand: "",
          buy_url: "",
          media_url: "",
          recomendation_media_url: "",
          related_recipe: null,
        },
        {
          description: "1 ruas jahe",
          recommendation: "",
          brand: "",
          buy_url: "",
          media_url: "",
          recomendation_media_url: "",
          related_recipe: null,
        },
        {
          description: "1 ruas kunyit",
          recommendation: "",
          brand: "",
          buy_url: "",
          media_url: "",
          recomendation_media_url: "",
          related_recipe: null,
        },
        {
          description: "1 butir kemiri",
          recommendation: "",
          brand: "",
          buy_url: "",
          media_url: "",
          recomendation_media_url: "",
          related_recipe: null,
        },
        {
          description: "4 sdm minyak sayur",
          recommendation: "",
          brand: "",
          buy_url: "",
          media_url: "",
          recomendation_media_url: "",
          related_recipe: null,
        },
      ],
    },
  ],
  nutrition: [],
  recook: [],
  cooking_tool: [],
  tips_and_trick: [],
  purchase_detail: [],
};
