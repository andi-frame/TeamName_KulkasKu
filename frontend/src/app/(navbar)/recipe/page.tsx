"use client";

import RecipeCard from "@/components/recipe/recipe-card";
import React from "react";

const Page = () => {
  return (
    <>
      <div>
        <div className="flex flex-wrap w-full">
          {data.map((recipe, index) => (
            <div key={recipe.id + index} className="w-1/2 p-2">
              <RecipeCard recipe={recipe} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Page;

const data = [
  {
    id: "fvVJJeZ88rqL9TBHgJzTKw==",
    title: "Ayam Goreng Ketumbar Lada Hitam",
    slug: "ayam-goreng-ketumbar-lada-hitam",
    cover_url:
      "content-images/images/20240102/z6gJzvjidUqALVNz7X96z09c7KQlBbbP-31373034323038323430d41d8cd98f00b204e9800998ecf8427e.jpg?x-oss-process=image/resize,m_fixed,h_600,w_600,image/format,webp,",
    rating: 5,
    cooking_time: 35,
    calories: "",
    release_date: 1706294460,
    is_editorial: false,
    step_count: 7,
    premium_content: false,
    visited_count: 0,
    is_bookmark: false,
    updated_at: 1706296005,
    subcategory: "Community",
    price: 0,
    author: {
      id: "Dj9Fs92z13dtucDql9mP-A==",
      uuid: "2824ebcc-8ea1-4a7c-93d2-989872ad584b",
      username: "diana-nurjanah",
      name: "Diana Nurjanah ",
      avatar:
        "content-images/images/20201122/JQRmh4jJxeheD27ne1L64mkA1QonHy31-31363036303131303436d41d8cd98f00b204e9800998ecf8427e.jpg?x-oss-process=image/resize,m_fixed,h_200,w_200,image/format,webp",
      is_following: false,
      is_official: false,
    },
    recook: {
      recook_count: 0,
      recook_list: [],
    },
    category: {
      name: "",
      slug: "",
    },
    tags: [
      {
        name: "Makanan Utama",
        slug: "makanan-utama",
      },
      {
        name: "Makanan Indonesia",
        slug: "makanan-indonesia",
      },
      {
        name: "Makanan Anak Kost",
        slug: "makanan-anak-kost",
      },
    ],
  },
  {
    id: "fvVJJeZ88rqL9TBHgJzTKw==",
    title: "Ayam Goreng Ketumbar Lada Hitam",
    slug: "ayam-goreng-ketumbar-lada-hitam",
    cover_url:
      "content-images/images/20240102/z6gJzvjidUqALVNz7X96z09c7KQlBbbP-31373034323038323430d41d8cd98f00b204e9800998ecf8427e.jpg?x-oss-process=image/resize,m_fixed,h_600,w_600,image/format,webp,",
    rating: 5,
    cooking_time: 35,
    calories: "",
    release_date: 1706294460,
    is_editorial: false,
    step_count: 7,
    premium_content: false,
    visited_count: 0,
    is_bookmark: false,
    updated_at: 1706296005,
    subcategory: "Community",
    price: 0,
    author: {
      id: "Dj9Fs92z13dtucDql9mP-A==",
      uuid: "2824ebcc-8ea1-4a7c-93d2-989872ad584b",
      username: "diana-nurjanah",
      name: "Diana Nurjanah ",
      avatar:
        "content-images/images/20201122/JQRmh4jJxeheD27ne1L64mkA1QonHy31-31363036303131303436d41d8cd98f00b204e9800998ecf8427e.jpg?x-oss-process=image/resize,m_fixed,h_200,w_200,image/format,webp",
      is_following: false,
      is_official: false,
    },
    recook: {
      recook_count: 0,
      recook_list: [],
    },
    category: {
      name: "",
      slug: "",
    },
    tags: [
      {
        name: "Makanan Utama",
        slug: "makanan-utama",
      },
      {
        name: "Makanan Indonesia",
        slug: "makanan-indonesia",
      },
      {
        name: "Makanan Anak Kost",
        slug: "makanan-anak-kost",
      },
    ],
  },
  {
    id: "gcSG8td-KoKcRIrVnKp9xQ==",
    title: "Ayam Goreng Ketumbar",
    slug: "ayam-goreng-ketumbar-17",
    cover_url:
      "content-images/images/20230130/IYZXoeXRVMNW3LDWJjJnr6y5tNXozode-31363735303435333637d41d8cd98f00b204e9800998ecf8427e.jpg?x-oss-process=image/resize,m_fixed,h_600,w_600,image/format,webp,",
    rating: 5,
    cooking_time: 40,
    calories: "",
    release_date: 1675046640,
    is_editorial: false,
    step_count: 7,
    premium_content: false,
    visited_count: 589,
    is_bookmark: false,
    updated_at: 1675046884,
    subcategory: "Community",
    price: 0,
    author: {
      id: "V-Kjssmqv8xxzf8Yl_HKMg==",
      uuid: "e6bfae2a-d0cf-4878-ac06-b906e282d319",
      username: "ayu-aura",
      name: "Ayu Aura",
      avatar:
        "content-images/images/20230603/i7LAKAQ3LwuAAkrRLD1cFuIJ3plXdvbH-31363835383033323231d41d8cd98f00b204e9800998ecf8427e.jpg?x-oss-process=image/resize,m_fixed,h_200,w_200,image/format,webp",
      is_following: false,
      is_official: false,
    },
    recook: {
      recook_count: 0,
      recook_list: [],
    },
    category: {
      name: "",
      slug: "",
    },
    tags: [
      {
        name: "Makanan Utama",
        slug: "makanan-utama",
      },
      {
        name: "Ayam goreng",
        slug: "ayam-goreng",
      },
      {
        name: "Makanan Pendamping",
        slug: "makanan-pendamping",
      },
      {
        name: "ayam",
        slug: "ayam",
      },
      {
        name: "Masakan Rumahan",
        slug: "masakan-rumahan",
      },
      {
        name: "Simple",
        slug: "simple",
      },
      {
        name: "Ketumbar",
        slug: "ketumbar",
      },
      {
        name: "Murah",
        slug: "murah",
      },
      {
        name: "Mudah",
        slug: "mudah",
      },
      {
        name: "Durasi 30-60 Menit",
        slug: "30-60m",
      },
      {
        name: "Harga 10-50 Ribu",
        slug: "10-50k",
      },
    ],
  },
];
