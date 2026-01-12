import React, { useState, useContext, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContent } from "../context/AppContext";

const CollegeEvents = () => {
  const { backendUrl } = useContext(AppContent);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    date: "",
    description: "",
  });

  const [images, setImages] = useState([]);

  /* INPUT HANDLER */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* IMAGE HANDLER */
  const handleImages = (e) => {
    const files = Array.from(e.target.files);

    if (files.length < 1) {
      toast.error("At least 1 image is required");
      return;
    }

    if (files.length > 3) {
      toast.error("Maximum 3 images allowed");
      return;
    }

    setImages(files);
  };

  /* SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.date || !form.description) {
      toast.error("All fields are required");
      return;
    }

    if (images.length < 1) {
      toast.error("At least one image is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("date", form.date);
    formData.append("description", form.description);

    // IMPORTANT: backend expects photo1, photo2, photo3
    formData.append("photo1", images[0]);
    if (images[1]) formData.append("photo2", images[1]);
    if (images[2]) formData.append("photo3", images[2]);

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/college/add-event-images`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (data.success) {
        toast.success("Event added successfully");

        setForm({ name: "", date: "", description: "" });
        setImages([]);

        // reset file input
        if (fileRef.current) {
          fileRef.current.value = "";
        }
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("CollegeEvents Error:", error);
      toast.error(error.response?.data?.message || "Server error");
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Add College Event Gallery
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Event Name */}
        <div>
          <label className="block font-medium mb-1">Event Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter event name"
            required
          />
        </div>

        {/* Event Date */}
        <div>
          <label className="block font-medium mb-1">Event Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* Images */}
        <div>
          <label className="block font-medium mb-1">
            Event Images (1–3)
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImages}
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-1">
            Selected: {images.length} image(s)
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-1">
            Image Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows="4"
            placeholder="Describe the event"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Submit Event
        </button>
      </form>
    </div>
  );
};

export default CollegeEvents;
