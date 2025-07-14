import { FoodCard } from "@/components/food-card";

export default function Fridge() {
  return (
    <div className="">
      <FoodCard
        foodName="Bayam"
        amount="2 ikat"
        createdAt={new Date(Date.now())}
        expiredAt={new Date(Date.now())}
      />
    </div>
  );
}
