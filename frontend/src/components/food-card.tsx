// Icons
import { Item } from "@/types/item.types";
import { ChevronRight, Leaf as LeafIcon } from "lucide-react";

export function FoodCard({ Name, Amount, StartDate, ExpDate }: Item) {
  function formattedDate() {
    const date = new Date(StartDate);
    if (isNaN(date.getTime())) return "Invalid date";

    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  const exp = new Date(ExpDate);
  const now = new Date();
  const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Choose background color
  const bgColor =
    daysLeft <= 0 ? "bg-red-500" : daysLeft <= 7 ? "bg-yellow-400" : "bg-green-500";

  // Helper for the subtitle line
  const expiryText =
    daysLeft < 0
      ? `kedaluwarsa sejak ${Math.abs(daysLeft)} hari lalu`
      : daysLeft === 0
      ? "kedaluwarsa hari ini"
      : `kedaluwarsa dalam ${daysLeft} hari`;

  return (
    <div className="relative w-full max-w-md rounded-lg shadow-md">
      {/* Dynamic background */}
      <div className={`${bgColor} h-20 rounded-lg w-full`} />

      {/* White content card */}
      <div className="absolute inset-0 ml-2 bg-white rounded-lg p-3 flex flex-col justify-center">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-start gap-3.5">
            <div className="w-4 h-4 my-1 relative overflow-hidden">
              <LeafIcon size={18} />
            </div>
            <div className="flex flex-col">
              <div className="text-base font-medium">{Name}</div>
              <div className="text-[10px]">dari {formattedDate()}</div>
              <div className="text-[10px]">{expiryText}</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-5">
            <div className="text-black text-xs">{Amount}</div>
            <div className="flex items-center gap-0.5">
              <div className="text-black text-[10px]">detail</div>
              <div className="w-5 h-4 relative">
                <ChevronRight size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
