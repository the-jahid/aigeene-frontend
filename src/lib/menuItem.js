import { PiBabyLight } from "react-icons/pi";
import { FaRegNewspaper } from "react-icons/fa"
import { FaIdCard } from "react-icons/fa";
import { IoDocumentAttach } from "react-icons/io5";
import { RiSecurePaymentFill } from "react-icons/ri";

export const menuItem = [
    {
        id:1,
        name:'Register New born',
        icon: <PiBabyLight size={32} color="#47AC47" />,
    },
    {
        id:2,
        name:'Iqama Renewal',
        icon: <FaRegNewspaper size={32} color="#47AC47" />,
    },
    {
        id:3,
        name:'Vehicles Registration Renewal',
        icon: <FaIdCard size={32} color="#47AC47" />,
    },
    {
        id:4,
        name:'Document Postal Delivery',
        icon: <IoDocumentAttach size={32} color="#47AC47" />,
    },
    {
        id:5,
        name:'Payment for the prisoners with financial cases',
        icon: <RiSecurePaymentFill size={32} color="#47AC47" />,
    }
]

