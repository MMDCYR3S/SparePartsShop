import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import BASE_API from "../../../BASE_API";
const Dashboard = () => {

  return (
    <>
    <div className="container mx-auto bg-blue-900">
      dashboard
      {BASE_API}
    </div>
    </>
  );
};

export default Dashboard;
