import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { AIAgentPanel } from "@/components/dashboard/AIAgentPanel";
import {
  Building2,
  Users2,
  Handshake,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex gap-8 p-8 bg-gray-50 min-h-screen">
      {/* Main Content Area */}
      <div className="flex-1 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-outfit">Dashboard</h1>
          <p className="text-gray-500">Xush kelibsiz, Admin!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Jami obyektlar"
            value="12,458"
            change="+12.5%"
            isPositive={true}
            icon={Building2}
            iconColor="bg-blue-600"
            subtitle="o'tgan oyga nisbatan"
          />
          <DashboardCard
            title="Yangi lidlar"
            value="3,256"
            change="+8.1%"
            isPositive={true}
            icon={Users2}
            iconColor="bg-emerald-500"
            subtitle="o'tgan oyga nisbatan"
          />
          <DashboardCard
            title="Faol bitimlar"
            value="86"
            change="+15.3%"
            isPositive={true}
            icon={Handshake}
            iconColor="bg-orange-500"
            subtitle="o'tgan oyga nisbatan"
          />
          <DashboardCard
            title="Jami daromad"
            value="$1,245,300"
            change="+18.7%"
            isPositive={true}
            icon={Wallet}
            iconColor="bg-indigo-600"
            subtitle="o'tgan oyga nisbatan"
          />
        </div>

        {/* Middle Section: Charts & Tables Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">So'nggi lidlar</h3>
              <button className="text-sm text-blue-600 font-medium hover:underline">Barchasini ko'rish</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                    <th className="pb-4 font-semibold">Ism</th>
                    <th className="pb-4 font-semibold">Manba</th>
                    <th className="pb-4 font-semibold">Budjet</th>
                    <th className="pb-4 font-semibold">Status</th>
                    <th className="pb-4 font-semibold">Vaqt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { name: "Farrux Mirzayev", source: "Telegram", budget: "$150,000", status: "Yangi", time: "10 min oldin" },
                    { name: "Malika Tursunova", source: "WhatsApp", budget: "$1,200 / oy", status: "Jarayonda", time: "25 min oldin" },
                    { name: "Diyorbek Karimov", source: "AI Agent", budget: "$250,000", status: "Qiziqish bor", time: "1 soat oldin" },
                    { name: "Sabina Akbarova", source: "Instagram", budget: "$800 / oy", status: "Yangi", time: "2 soat oldin" },
                  ].map((lead, i) => (
                    <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 text-sm font-medium text-gray-900">{lead.name}</td>
                      <td className="py-4 text-sm text-gray-500">{lead.source}</td>
                      <td className="py-4 text-sm font-bold text-gray-900">{lead.budget}</td>
                      <td className="py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                          lead.status === "Yangi" ? "bg-blue-100 text-blue-600" :
                            lead.status === "Jarayonda" ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"
                        )}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-gray-400">{lead.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-lg mb-6">Lidlar manbalari</h3>
            <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-100 rounded-2xl">
              <span className="text-gray-400 text-sm">Chart Placeholder</span>
            </div>
            <div className="mt-6 space-y-3">
              {[
                { label: "AI Agent", value: "40%", color: "bg-blue-600" },
                { label: "Telegram", value: "25%", color: "bg-sky-500" },
                { label: "WhatsApp", value: "15%", color: "bg-emerald-500" },
                { label: "Boshqa", value: "20%", color: "bg-gray-400" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", item.color)} />
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Agent Sidebar Panel */}
      <AIAgentPanel />
    </div>
  );
}
