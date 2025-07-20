"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronLeft } from "lucide-react";

const Page = () => {
  const [namaMakanan, setNamaMakanan] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [satuan, setSatuan] = useState("satuan");
  const [tanggalMasuk, setTanggalMasuk] = useState("");
  const [tanggalKedaluwarsa, setTanggalKedaluwarsa] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  useEffect(() => {
    const today = new Date();
    const formatted = today.toISOString().split("T")[0]; // "yyyy-mm-dd"
    setTanggalMasuk(formatted);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/item/create",
        {
          namaMakanan,
          jumlah: parseFloat(jumlah),
          satuan,
          tanggalMasuk,
          tanggalKedaluwarsa,
          deskripsi,
        },
        {
          withCredentials: true,
        }
      );

      console.log("Response:", response.data);
      alert("Item berhasil ditambahkan!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error:", err.response?.data || err.message);
      alert("Gagal menambahkan item.");
    }
  };

  return (
    <div className="w-full p-4 flex flex-col justify-start gap-3">
      <div className="flex gap-1 items-center">
        <ChevronLeft size={35} strokeWidth={1} />
        <span className="text-md font-extralight">Tambah Makanan</span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col justify-center pt-6">
        <div className="text-xl font-bold py-5">Tambahkan Bahan</div>

        <div className="flex flex-col gap-3">
          {/* Nama Makanan */}
          <div className="flex flex-col">
            <label htmlFor="namaMakanan" className="text-xs font-semibold py-1">
              Nama Makanan
            </label>
            <input
              type="text"
              id="namaMakanan"
              className="text-xs ring-1 ring-[#CBD5E1] rounded-md p-2 focus:outline-[#5DB1FF]"
              placeholder="Masukkan nama makanan"
              value={namaMakanan}
              onChange={(e) => setNamaMakanan(e.target.value)}
            />
          </div>

          {/* Jumlah & Satuan */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold py-1">Jumlah</label>
            <div className="flex gap-3 w-full">
              <input
                type="float"
                className="text-xs ring-1 ring-[#CBD5E1] flex-shrink rounded-md p-2 min-w-0 w-1/2 focus:outline-[#5DB1FF]"
                placeholder="Masukkan jumlah"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
              />
              <select
                className="text-xs ring-1 ring-[#CBD5E1] flex-shrink rounded-md p-2 min-w-0 w-1/2 focus:outline-[#5DB1FF]"
                value={satuan}
                onChange={(e) => setSatuan(e.target.value)}>
                <option value="kilogram">Kilogram</option>
                <option value="liter">Liter</option>
                <option value="ikat">Ikat</option>
                <option value="satuan">Satuan</option>
              </select>
            </div>
          </div>

          {/* Tanggal Masuk */}
          <div className="flex flex-col">
            <label htmlFor="tanggalMasuk" className="text-xs font-semibold py-1">
              Tanggal Masuk
            </label>
            <input
              type="date"
              id="tanggalMasuk"
              className="text-xs ring-1 ring-[#CBD5E1] rounded-md p-2 focus:outline-[#5DB1FF]"
              value={tanggalMasuk}
              onChange={(e) => setTanggalMasuk(e.target.value)}
            />
          </div>

          {/* Tanggal Kedaluwarsa */}
          <div className="flex flex-col">
            <label htmlFor="tanggalKedaluwarsa" className="text-xs font-semibold py-1">
              Tanggal Kedaluwarsa
            </label>
            <div className="w-full flex gap-3">
              <input
                type="date"
                id="tanggalKedaluwarsa"
                className="text-xs ring-1 ring-[#CBD5E1] flex-shrink rounded-md p-2 min-w-0 w-2/3 focus:outline-[#5DB1FF]"
                value={tanggalKedaluwarsa}
                onChange={(e) => setTanggalKedaluwarsa(e.target.value)}
              />
              <button
                type="button"
                className="text-xs text-center min-w-0 w-1/3 py-2 bg-[#5DB1FF] rounded-md text-white font-semibold flex-shrink">
                Scan
              </button>
            </div>
          </div>

          {/* Deskripsi */}
          <div className="flex flex-col">
            <label htmlFor="deskripsi" className="text-xs font-semibold py-1">
              Deskripsi
            </label>
            <input
              type="text"
              id="deskripsi"
              className="text-xs ring-1 ring-[#CBD5E1] rounded-md p-2 focus:outline-[#5DB1FF]"
              placeholder="Masukkan deskripsi makanan"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="w-full pt-10">
          <button type="submit" className="text-xs text-center w-full py-2 bg-[#5DB1FF] rounded-md text-white font-semibold">
            Tambah
          </button>
        </div>
      </form>
    </div>
  );
};

export default Page;
