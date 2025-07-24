// import { FoodCard } from "@/components/food-card";

import ExpiredGroup from "@/components/fridge/expired-group";
import FreshGroup from "@/components/fridge/fresh-group";
import FilterSortBar from "@/components/fridge/filter-sort-bar";
import ExpiryNotification from "@/components/expiry-notification";

export default function Fridge() { 


  return (
    <div className="pb-28">
      <ExpiryNotification />
      <div className="sticky top-0 z-10">
        <FilterSortBar />
      </div>
      <div className="px-4">
        <ExpiredGroup/>
        <FreshGroup />
      </div>
    </div>
  );
}
