import React from "react";
import styles from "./HighOrderComponent.module.css";
import { Outlet, useLocation } from "react-router-dom";
import FranchiseNavigation from "../user/franchise/FranchiseNavigation";
import AdminNavigation from "../admin/AdminNavigation";

function HighOrderComponent() {
  const currentPath = useLocation();
  const isAdmin = currentPath.pathname.startsWith("/admin");
  const isFranchise = currentPath.pathname.startsWith("/franchise");
  return (
    <div className={styles.app__container}>
      {isAdmin && <AdminNavigation />}
      {isFranchise && <FranchiseNavigation />}
      <div className={styles.main__content}>
        <Outlet />
      </div>
    </div>
  );
}

export default HighOrderComponent;
