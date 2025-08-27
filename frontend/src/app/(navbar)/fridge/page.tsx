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

      <div className="px-4 md:px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-6 w-full">
          <section className="md:col-span-1 space-y-4">
            <ExpiredGroup />
          </section>

          <section className="md:col-span-2">
            <FreshGroup />
          </section>
        </div>
      </div>
    </div>
  );
}
