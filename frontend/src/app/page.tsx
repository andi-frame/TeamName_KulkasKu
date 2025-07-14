import { Header } from "@/components/header";
import { Navbar } from "@/components/navbar";

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
    </div>
  );
}
