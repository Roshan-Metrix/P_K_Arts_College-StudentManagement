import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";

const CollegeCourses = () => {
  const { backendUrl } = useContext(AppContent);

  const [courses, setCourses] = useState([]);
  const [pdf, setPdf] = useState(null);

  const [form, setForm] = useState({
    sub_name: "",
    file_name: "",
    file_desc: "",
  });

  /*  FETCH COURSES  */
  const fetchCourses = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/roles/get-courses-years`,
        { withCredentials: true }
      );

      if (data.success) {
        setCourses(data.courses || []);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [backendUrl]);

  /*  INPUT HANDLERS  */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePdf = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed")
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("PDF must be under 10MB")
      return;
    }

    setPdf(file);
  };

  /*  SUBMIT  */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.sub_name || !form.file_name || !pdf) {
      toast.error("Subject, File Name and PDF are required")
      return;
    }

    const data = new FormData();
    data.append("sub_name", form.sub_name);
    data.append("file_name", form.file_name);
    data.append("file_desc", form.file_desc);
    data.append("file", pdf); // multer field name

    try {
      const { data: result } = await axios.post(
        `${backendUrl}/api/college/add-course-files`,
        data,
        { withCredentials: true }
      );

      if (result.success) {
        toast.success("PDF uploaded successfully")
        setForm({ sub_name: "", file_name: "", file_desc: "" });
        setPdf(null);
      } else {
        toast.error(result.message || "Upload failed")
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error")
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-white shadow-xl rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Upload Course PDF</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* SUBJECT */}
        <div>
          <label className="block font-medium mb-1">Subject</label>
          <select
            name="sub_name"
            value={form.sub_name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select subject</option>
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>

        {/* FILE NAME */}
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

        {/* DESCRIPTION */}
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

        {/* PDF */}
        <div>
          <label className="block font-medium mb-1">Upload PDF</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handlePdf}
            className="w-full cursor-pointer"
            required
          />
          {pdf && (
            <p className="text-sm text-gray-500 mt-1">
              Selected: {pdf.name}
            </p>
          )}
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 cursor-pointer"
        >
          Upload PDF
        </button>
      </form>
    </div>
  );
};

export default CollegeCourses;
