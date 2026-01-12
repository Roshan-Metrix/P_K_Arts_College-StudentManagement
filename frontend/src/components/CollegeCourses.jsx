import React, { useState } from "react";
import { useContext } from "react";
import { AppContent } from "../context/AppContext";

const CollegeCourses = () => {
  const { backendUrl } = useContext(AppContent)
  const [form, setForm] = useState({
    sub_name: "",
    file_name: "",
    file_desc: "",
  });

  const [pdf, setPdf] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePdf = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("PDF must be less than 10MB");
      return;
    }

    setPdf(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.sub_name || !form.file_name || !pdf) {
      alert("Subject, File Name & PDF are required");
      return;
    }

    const data = new FormData();
    data.append("sub_name", form.sub_name);
    data.append("file_name", form.file_name);
    data.append("file_desc", form.file_desc);
    data.append("file", pdf);
    data.append("file_type", "pdf");

    try {
      const res = await axios.post(`${backendUrl}/api/courses`,data);

      const result = await res.json();

      if (result.success) {
        alert("PDF uploaded successfully");
        setForm({ sub_name: "", file_name: "", file_desc: "" });
        setPdf(null);
      } else {
        alert(result.message || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-white shadow-xl rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Upload Course PDF</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Subject Name */}
        <div>
          <label className="block font-medium mb-1">Subject Name</label>
          <input
            type="text"
            name="sub_name"
            value={form.sub_name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* File Name */}
        <div>
          <label className="block font-medium mb-1">File Name</label>
          <input
            type="text"
            name="file_name"
            value={form.file_name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-1">File Description</label>
          <textarea
            name="file_desc"
            value={form.file_desc}
            onChange={handleChange}
            rows="4"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* PDF Upload */}
        <div>
          <label className="block font-medium mb-1">Upload PDF</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handlePdf}
            className="w-full"
            required
          />
          {pdf && (
            <p className="text-sm text-gray-500 mt-1">
              Selected: {pdf.name}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Upload PDF
        </button>
      </form>
    </div>
  );
};

export default CollegeCourses;
