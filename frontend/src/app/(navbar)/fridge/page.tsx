"use client"

import ExpiredGroup from "@/components/fridge/expired-group";
import FreshGroup from "@/components/fridge/fresh-group";
import FilterSortBar from "@/components/fridge/filter-sort-bar";
import ExpiryNotification from "@/components/expiry-notification";
import { useExpiredStore } from "@/store/useExpiredStore";

export default function Fridge() { 
  const hasExpiredItems = useExpiredStore((state) => state.isExpired);

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

          <section className={hasExpiredItems ? "md:col-span-2" : "md:col-span-3"}>
            <FreshGroup />
          </section>
        </div>
      </div>
    </div>
  );
}
