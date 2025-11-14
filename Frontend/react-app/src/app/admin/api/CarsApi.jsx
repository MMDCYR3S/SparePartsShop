import axios from "axios";
import BASE_API from "../../BASE_API";

const CarsData = async () => {
  try {
    const response = await axios.get(BASE_API + "dashboard/admin/cars/");
    return response.data;
  } catch (error) {
    console.error("Error fetching cars data:", error);
  }
};

export default CarsData;
