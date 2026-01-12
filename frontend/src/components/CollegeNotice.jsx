import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";

const CollegeNotice = () => {
   const { backendUrl } = useContext(AppContent);

  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Fetch notice
  const fetchNotice = async () => {

    try {
      setLoading(true);

      const res = await axios.get(
        `${backendUrl}/api/college/get-notice`
      );

      console.log("GET RESPONSE:", res.data);

      if (
        res.data?.success &&
        Array.isArray(res.data.notices) &&
        res.data.notices.length > 0
      ) {
        setNotice(res.data.notices[0].notice);
      } else {
        setNotice("");
      }
    } catch (err) {
      console.error("Error fetching notice:", err);
      toast.error("Failed to fetch notice");
      setNotice("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotice();
  }, []);

  //  Update notice
  const updateNotice = async () => {
    if (!notice.trim()) {
      toast.warning("Notice cannot be empty");
      return;
    }

    try {
      setUpdating(true);

      const res = await axios.put(
        `${backendUrl}/api/college/update-notice`,
        { notice }
      );

      if (res.data?.success) {
        toast.success("Notice updated successfully");
        fetchNotice();
      } else {
        toast.error(res.data?.message || "Update failed");
      }
    } catch (err) {
      console.error("Error updating notice:", err);
      toast.error("Failed to update notice");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">College Notice</h2>

      {loading ? (
        <p className="text-gray-500">Loading notice...</p>
      ) : (
        <>
          <textarea
            value={notice}
            onChange={(e) => setNotice(e.target.value)}
            rows={4}
            className="w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter college notice..."
          />

          <button
            onClick={updateNotice}
            disabled={updating}
            className={`mt-4 px-6 py-2 rounded text-white font-semibold cursor-pointer
              ${
                updating
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {updating ? "Updating..." : "Update Notice"}
          </button>
        </>
      )}
    </div>
  );
};

export default CollegeNotice;
