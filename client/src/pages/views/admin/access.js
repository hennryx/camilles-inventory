import AddNewUser from "./addNewUser";
import DashBoard from "./dashboard";
import Inventory from "./inventory";
import AddNewSupplier from "./addNewSupplier";
import Reports from "./reports";
import Purchase from "./purchase";

import { BsGrid1X2, BsPersonAdd, BsBox, BsTruck } from "react-icons/bs";
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
    name: "Add new User",
    path: "/add-new-user",
    icon: BsPersonAdd,
    element: AddNewUser,
  },

  {
    name: "Products",
    path: "/inventory",
    icon: BsBox,
    element: Inventory,
  },

  {
    name: "Add new Supplier",
    path: "/add-new-supplier",
    icon: BsTruck,
    element: AddNewSupplier,
  },

  {
    name: "Purchase",
    path: "/purchase",
    icon: LuClipboardList,
    element: Purchase,
  },

  {
    name: "Reports",
    path: "/reports",
    icon: HiOutlineDocumentReport,
    element: Reports,
  },  
]

export default access;