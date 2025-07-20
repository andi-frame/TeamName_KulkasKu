"use client";

import { Item } from "@/types/item.types";
import api from "@/utils/axios";
import React, { useState } from "react";

// TODO: change window.confirm to use customized popup

const FoodCardPopup = ({ ID, Name, Type, Amount, AmountType, Desc, StartDate, ExpDate }: Item) => {
  const [name, setName] = useState(Name);
  const [type, setType] = useState(Type);
  const [amount, setAmount] = useState(Amount.toString());
  const [amountType, setAmountType] = useState(AmountType);
  const [startDate, setStartDate] = useState(StartDate.slice(0, 10));
  const [expDate, setExpDate] = useState(ExpDate.slice(0, 10));
  const [desc, setDesc] = useState(Desc);

  const hasChanges =
    name !== Name ||
    type !== Type ||
    amount !== Amount.toString() ||
    amountType !== AmountType ||
    startDate !== StartDate.slice(0, 10) ||
    expDate !== ExpDate.slice(0, 10) ||
    (desc ?? "") !== (Desc ?? "");

  const updateButtonHandler = async () => {
    if (!hasChanges) {
      alert("Tidak ada perubahan data.");
      return;
    }

    const confirm = window.confirm("Apakah Anda yakin ingin memperbarui item ini?");
    if (!confirm) return;

    try {
      const response = await api.put("/item/update", {
        ID,
        name,
        type,
        amount: parseFloat(amount),
        amountType,
        desc,
        startDate,
        expDate,
      });

      console.log("Response:", response.data);
      alert("Item berhasil ditambahkan!");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error:", err.response?.data || err.message);
      alert("Gagal memperbarui item.");
    }
  };

  const deleteButtonHandler = async () => {
    const confirm = window.confirm("Apakah Anda yakin ingin menghapus item ini?");
    if (!confirm) return;

    try {
      const response = await api.delete(`/item/delete/${ID}`);

      console.log("Response:", response.data);
      alert("Item berhasil dihapus!");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error:", err.response?.data || err.message);
      alert("Gagal menghapus item.");
    }
  };

  return (
    <div className="flex flex-col justify-center">
      <div className="text-xl font-bold py-2">Detail Item</div>

      <div className="flex flex-col gap-3">
        {/* Nama Item */}
        <div className="flex flex-col">
          <label htmlFor="name" className="text-xs font-semibold py-1">
            Nama Item {name != Name ? <span className="text-xs text-gray-500">({Name})</span> : ""}
          </label>
          <input
            type="text"
            id="name"
            className="text-xs ring-1 ring-[#CBD5E1] rounded-md p-2 focus:outline-[#5DB1FF]"
            placeholder="Masukkan nama item"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Tipe Item */}
        <div className="flex flex-col">
          <label htmlFor="type" className="text-xs font-semibold py-1">
            Tipe Item {type != Type ? <span className="text-xs text-gray-500">({Type})</span> : ""}
          </label>
          <input
            list="type-options"
            type="text"
            id="type"
            className="text-xs ring-1 ring-[#CBD5E1] rounded-md p-2 focus:outline-[#5DB1FF]"
            placeholder="Masukkan tipe item"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
          <datalist id="type-options">
            <option value="Sayur" />
            <option value="Rempah" />
            <option value="Buah" />
            <option value="Daging" />
            <option value="Minuman" />
            <option value="Lainnya" />
          </datalist>
        </div>

        {/* Jumlah & Satuan */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold py-1">
            Jumlah{" "}
            {amount != Amount.toString() || amountType != AmountType ? (
              <span className="text-xs text-gray-500">({Amount + " " + AmountType})</span>
            ) : (
              ""
            )}
          </label>
          <div className="flex gap-3 w-full">
            <input
              type="float"
              className="text-xs ring-1 ring-[#CBD5E1] flex-shrink rounded-md p-2 min-w-0 w-1/2 focus:outline-[#5DB1FF]"
              placeholder="Masukkan jumlah"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <select
              className="text-xs ring-1 ring-[#CBD5E1] flex-shrink rounded-md p-2 min-w-0 w-1/2 focus:outline-[#5DB1FF]"
              value={amountType}
              onChange={(e) => setAmountType(e.target.value)}>
              <option value="kilogram">Kilogram</option>
              <option value="liter">Liter</option>
              <option value="ikat">Ikat</option>
              <option value="satuan">Satuan</option>
            </select>
          </div>
        </div>

        {/* Tanggal Masuk */}
        <div className="flex flex-col">
          <label htmlFor="startDate" className="text-xs font-semibold py-1">
            Tanggal Masuk{" "}
            {startDate != StartDate.slice(0, 10) ? <span className="text-xs text-gray-500">({StartDate.slice(0, 10)})</span> : ""}
          </label>
          <input
            type="date"
            id="startDate"
            className="text-xs ring-1 ring-[#CBD5E1] rounded-md p-2 focus:outline-[#5DB1FF]"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        {/* Tanggal Kedaluwarsa */}
        <div className="flex flex-col">
          <label htmlFor="expDate" className="text-xs font-semibold py-1">
            Tanggal Kedaluwarsa{" "}
            {expDate != ExpDate.slice(0, 10) ? <span className="text-xs text-gray-500">({ExpDate.slice(0, 10)})</span> : ""}
          </label>
          <div className="w-full flex gap-3">
            <input
              type="date"
              id="expDate"
              className="text-xs ring-1 ring-[#CBD5E1] flex-shrink rounded-md p-2 min-w-0 w-full focus:outline-[#5DB1FF]"
              value={expDate}
              onChange={(e) => setExpDate(e.target.value)}
            />
          </div>
        </div>

        {/* Deskripsi */}
        <div className="flex flex-col">
          <label htmlFor="desc" className="text-xs font-semibold py-1">
            Deskripsi {(desc ?? "") != (Desc ?? "") ? <span className="text-xs text-gray-500">({Desc})</span> : ""}
          </label>
          <input
            type="text"
            id="desc"
            className="text-xs ring-1 ring-[#CBD5E1] rounded-md p-2 focus:outline-[#5DB1FF]"
            placeholder="Masukkan deskripsi makanan"
            value={desc ?? ""}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="w-full pt-10 flex gap-5">
        <button
          className={`text-xs text-center w-1/2 py-2 rounded-md text-white font-semibold ${
            hasChanges ? "bg-[#5DB1FF] hover:bg-blue-500" : "bg-gray-300 cursor-not-allowed"
          }`}
          onClick={updateButtonHandler}
          disabled={!hasChanges}>
          Perbarui
        </button>
        <button
          className="text-xs text-center w-1/2 py-2 bg-red-400 rounded-md text-white font-semibold"
          onClick={deleteButtonHandler}>
          Hapus
        </button>
      </div>
    </div>
  );
};

export default FoodCardPopup;
