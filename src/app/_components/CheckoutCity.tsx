"use client";
import {pakistanCities} from "../_data/store-settings";
import {useStoreSettings} from "./StoreSettingsProvider";
import CustomSelect from "./CustomSelect";
export default function CheckoutCity({choice,city,onChoiceChange,onCityChange,disabled}:{choice:string;city:string;onChoiceChange:(value:string)=>void;onCityChange:(value:string)=>void;disabled:boolean}){
 const {settings}=useStoreSettings();const cities=[...new Set([...pakistanCities,...Object.keys(settings.city_rates)])].sort();
 return <div className="space-y-3"><CustomSelect label="Delivery city" value={choice} disabled={disabled} onChange={value=>{onChoiceChange(value);onCityChange(value==="Other"?"":value);}} options={[{value:"",label:"Choose your city"},...cities.map(value=>({value,label:value})),{value:"Other",label:"Other city"}]}/>{choice==="Other"?<label className="block text-xs">City name<input required name="city" value={city} disabled={disabled} maxLength={80} onChange={event=>onCityChange(event.target.value)} className="checkout-input mt-2 rounded-xl" autoComplete="address-level2"/></label>:<input type="hidden" name="city" value={city}/>}</div>;
}
