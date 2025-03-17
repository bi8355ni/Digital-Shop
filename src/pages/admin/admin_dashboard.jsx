import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore"; 
import { db } from "../../firebase"; // Adjust the path as necessary

const AdminDashboard = () => {
  const [orderCounts, setOrderCounts] = useState({
    pending: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "orders"));
        const counts = { pending: 0, shipped: 0, delivered: 0, cancelled: 0 };

        querySnapshot.forEach(doc => {
          const order = doc.data();
          if (order.status === "pending") counts.pending++;
          else if (order.status === "shipped") counts.shipped++;
          else if (order.status === "delivered") counts.delivered++;
          else if (order.status === "cancelled") counts.cancelled++;
        });

        setOrderCounts(counts);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded bg-yellow-100">
          <p className="text-lg font-medium">Pending Orders</p>
          <p className="text-2xl">{orderCounts.pending}</p>
        </div>
        <div className="p-4 border rounded bg-blue-100">
          <p className="text-lg font-medium">Shipped Orders</p>
          <p className="text-2xl">{orderCounts.shipped}</p>
        </div>
        <div className="p-4 border rounded bg-green-100">
          <p className="text-lg font-medium">Delivered Orders</p>
          <p className="text-2xl">{orderCounts.delivered}</p>
        </div>
        <div className="p-4 border rounded bg-red-100">
          <p className="text-lg font-medium">Cancelled Orders</p>
          <p className="text-2xl">{orderCounts.cancelled}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;