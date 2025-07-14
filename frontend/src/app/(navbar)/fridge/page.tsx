import { FoodCard } from "@/components/food-card";
import { ExpiredGroup } from "./expired-group";

export default function Fridge() {
  return (
    <div className="">
      <ExpiredGroup/>
      <FoodCard
        foodName="Bayam"
        amount="2 ikat"
        createdAt={new Date(Date.now())}
        expiredAt={new Date(Date.now())}
      />
    </div>
  );
}
