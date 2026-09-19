"use client";
import {useState} from "react";
import type {OrderRequest} from "../_data/order-requests";
import useAdminRows from "../_hooks/useAdminRows";
import CustomSelect from "./CustomSelect";
import OrderRequestCard from "./OrderRequestCard";
export default function CustomerRequests({onOpenOrder}:{onOpenOrder:(id:string)=>void}){
 const {rows,error,loading,reload}=useAdminRows<OrderRequest>("order_requests");const [filter,setFilter]=useState("open");const visible=rows.filter(row=>filter==="all"||["Pending","Approved"].includes(row.status));
 return <section className="admin-panel rounded-[28px] border border-black/[0.06] bg-white p-5 sm:p-7"><div className="flex flex-wrap justify-between gap-4"><h2 className="text-2xl font-medium tracking-tight">Customer requests</h2><CustomSelect label="Request filter" value={filter} onChange={setFilter} options={[{value:"open",label:"Open requests"},{value:"all",label:"All requests"}]}/></div><button type="button" onClick={()=>void reload()} className="mt-3 text-xs underline">Refresh requests</button>{error&&<p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}<div className="mt-5 space-y-4">{visible.map(request=><OrderRequestCard key={`${request.id}-${request.status}-${request.admin_note}`} request={request} onSaved={()=>void reload()} onOpenOrder={onOpenOrder}/>)}{!visible.length&&<p className="text-sm text-black/50">{loading?"Loading requests…":"No customer requests in this view."}</p>}</div></section>;
}
