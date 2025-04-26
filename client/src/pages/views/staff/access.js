import DashBoard from "./dashboard";
import Inventory from "./inventory";
import Reports from "./reports";
import Purchase from "./purchase";
import Returns from "./returns";

import { BsGrid1X2, BsBox } from "react-icons/bs";
import { LuClipboardList } from "react-icons/lu";
import { HiOutlineDocumentReport } from "react-icons/hi";

const access = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: BsGrid1X2,
    element: DashBoard,
  },

  {
    name: "Products",
    path: "/inventory",
    icon: BsBox,
    element: Inventory,
  },
  
  {
    name: "Purchase",
    path: "/purchase",
    icon: LuClipboardList,
    element: Purchase,
  },

  {
    name: "Returns",
    path: "/returns",
    icon: LuClipboardList,
    element: Returns,
  },

  {
    name: "Reports",
    path: "/reports",
    icon: HiOutlineDocumentReport,
    element: Reports,
  },  
]

export default access;