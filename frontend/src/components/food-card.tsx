// Icons
import { ChevronRight } from "lucide-react"
import { LeafIcon } from "lucide-react"

interface FoodCardProps {
	foodName: string,
	amount: string,			// jumlah + satuannya
	createdAt: Date,
	expiredAt: Date,
}

export function FoodCard({
  foodName,
  amount,
  createdAt,
  expiredAt,
}: FoodCardProps) {
  function formattedDate() {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(createdAt);
  }

  function daysLeft() {
	  return Math.ceil((expiredAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="relative w-full max-w-md rounded-lg shadow-md">
      {/* Green background */}
      <div className="bg-green-500 h-20 rounded-lg w-full"></div>

      {/* White content card */}
      <div className="absolute inset-0 ml-2 bg-white rounded-lg p-3 flex flex-col justify-center">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-start gap-3.5">
            <div className="w-4 h-4 my-1 relative overflow-hidden">
              <LeafIcon size={18}/>
            </div>
            <div className="flex flex-col">
              <div className="text-base font-medium">{foodName}</div>
              <div className="text-[10px]">dari {formattedDate()}</div>
              <div className="text-[10px]">kedaluwarsa dalam {daysLeft()} hari</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-5">
            <div className="text-black text-xs">{amount}</div>
            <div className="flex items-center gap-0.5">
              <div className="text-black text-[10px] ">detail</div>
              <div className="w-5 h-4 relative">
                <ChevronRight size={18}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
