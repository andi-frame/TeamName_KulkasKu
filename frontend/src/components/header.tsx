import { MenuBar } from "./menu-bar"
import { 
    Search, 
    ArrowDownWideNarrow 
} from "lucide-react"

export function Header() {
    return (
        <div className="flex flex-col p-6 pb-0 gap-6 shadow-md">
            <div className="w-full inline-flex flex-col justify-start items-start gap-6">
                <div className="relative">
                    <Search size={24} strokeWidth={2}/>
                </div>
                <div className="self-stretch inline-flex justify-between items-center">
                    <div className="justify-start text-2xl font-semibold leading-snug">
                        KulkasKu
                    </div>
                    <div className="w-7 h-7 relative overflow-hidden">
                        <ArrowDownWideNarrow size={28} strokeWidth={1} />
                    </div>
                </div>
                <div className="overflow-x-auto whitespace-nowrap scroll-smooth">
                    <MenuBar/>
                </div>
            </div>
        </div>
    )
}