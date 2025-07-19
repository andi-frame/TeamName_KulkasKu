import { Header } from "@/components/header";
import { Navbar } from "@/components/navbar";
// import { FoodScanner } from "@/components/food-scanner";

export default function Home() {
  return (
    <div className="bg-white">
      <Header></Header>
      <Navbar></Navbar>
      {/* <MenuBar/> */}
      {/* <BahanCard
        NamaBahan="Bayam"
        jumlah="2 ikat"
        tanggalAwal={new Date(Date.now())}
        tanggalKedaluwarsa={new Date(Date.now())}
      /> */}
      {/* <FoodScanner 
        onBarcodeResult={(result) => console.log("Barcode result:", result)}
        onImageResult={(result) => console.log("Image result:", result)}
        onReceiptResult={(result) => console.log("Receipt result:", result)}
      /> */}

    </div>
  );
}
