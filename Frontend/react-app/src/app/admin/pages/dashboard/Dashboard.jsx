import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
// import BASE_API from "../../../BASE_API";
import CarsData from "../../api/CarsApi";
const Dashboard = () => {
useEffect(() => {
  console.log(CarsData());
  
}, []);

  return (
    <>

    <div className="container mx-auto bg-blue-900">
      dashboard
    </div>
    </>
  );
};

export default Dashboard;
