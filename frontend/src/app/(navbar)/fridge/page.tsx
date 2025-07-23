// import { FoodCard } from "@/components/food-card";

import ExpiredGroup from "@/components/fridge/expired-group";
import FreshGroup from "@/components/fridge/fresh-group";

export default function Fridge() { 


  return (
    <div className="pb-28">
      <ExpiredGroup/>
      <FreshGroup />
    </div>
  );
}
