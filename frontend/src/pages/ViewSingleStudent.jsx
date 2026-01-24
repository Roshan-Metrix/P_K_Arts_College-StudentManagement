import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import NavInsideBar from "../components/NavInsideBar";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";

const ViewSingleStudent = () => {
  const { student_uid } = useParams();
  const { backendUrl } = useContext(AppContent);
  const [data, setData] = useState(null);

  //  Fetch Student Full Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/roles/viewStudentData/${student_uid}`,
          { withCredentials: true },
        );
        if (data.success) {
          setData(data);
        } else toast.error(data.message);
      } catch (error) {
        toast.error("Error fetching student: " + error.message);
      }
    };
    fetchData();
  }, [backendUrl, student_uid]);

  if (!data)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 flex items-center justify-center">
        <p className="text-slate-600 text-lg sm:text-xl">
          Loading student data...
        </p>
      </div>
    );

  const student = data.student;
  const fees = data.student_fees?.[0] || {};
  const attendance = data.student_attendance?.[0] || {};
  const semesters = data.student_semesters?.[0] || {};

  //  Helper data builders
  const personalDetails = [
    ["Student UID", student.student_uid],
    ["Name", student.name],
    ["Email", student.email],
    ["DOB", student.dob?.split("T")[0]],
    ["Father's Name", student.fatherName],
    ["Father's Occupation", student.fatherOccupation],
    ["Mother's Name", student.motherName],
    ["Mother's Occupation", student.motherOccupation],
    ["Medium of Instruction", student.mediumOfInstruction],
    ["Marks Scored", student.marksScored],
    ["Percentage", student.percentage],
    ["School Name & Place", student.schoolNamePlace],
    ["Religion", student.religion],
    ["Nationality", student.nationality],
    ["Category", student.category],
    ["Date of Admission", student.dateOfAdmission?.split("T")[0]],
    ["Date of Leaving", student.dateOfLeaving?.split("T")[0] || "—"],
    ["Aadhaar", student.aadhaar],
    ["Contact No", student.contactNo],
    ["Address", student.address],
    ["Gender", student.gender],
    ["Course", student.course],
    ["Year", student.year],
    ["Blood Group", student.bloodGroup],
    ["Scholarship Details", student.scholarshipDetails],
  ];

  const semesterRows = [...Array(8)].map((_, i) => ({
    sem: `Semester ${i + 1}`,
    examFees: semesters[`examfeesSem${i + 1}`] || "—",
    gpa: semesters[`gpaSem${i + 1}`] || "—",
    cgpa: semesters[`cgpaSem${i + 1}`] || "—",
    marksheet: semesters[`marksheetSem${i + 1}`] || "—",
  }));

  const feesTable = [
    ["I", fees.feesYear1 || "—"],
    ["II", fees.feesYear2 || "—"],
    ["III", fees.feesYear3 || "—"],
    ["IV", fees.feesYear4 || "—"],
  ];

  const attendanceTable = [
    ["Sem 1", attendance.attendanceSem1 || "—"],
    ["Sem 2", attendance.attendanceSem2 || "—"],
    ["Sem 3", attendance.attendanceSem3 || "—"],
    ["Sem 4", attendance.attendanceSem4 || "—"],
    ["Sem 5", attendance.attendanceSem5 || "—"],
    ["Sem 6", attendance.attendanceSem6 || "—"],
    ["Sem 7", attendance.attendanceSem7 || "—"],
    ["Sem 8", attendance.attendanceSem8 || "—"],
  ];

  //  Exports
 const downloadPDF = async () => {
  const doc = new jsPDF("p", "mm", "a4");

  /*  IMAGE HELPER  */
  const loadImageAsBase64 = async (url) => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  /*  HEADER  */

  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text("PERUNTHALAIVAR KAMARAJAR ARTS COLLEGE", 105, 15, { align: "center" });

  doc.setFontSize(11);
  doc.text("Department of Commerce", 105, 22, { align: "center" });

  doc.setFontSize(12);
  doc.text("STUDENTS PROFILE", 105, 32, { align: "center" });

  doc.line(15, 35, 195, 35);

  /*  PHOTO  */

  if (student.photo) {
    try {
      const img = await loadImageAsBase64(student.photo);
      doc.addImage(img, "JPEG", 160, 40, 30, 35);
      doc.rect(160, 40, 30, 35);
    } catch {}
  }

  /*  STUDENT DETAILS  */

  const studentDetails = [
    ["Name (as per Qualifying Records)", student.name],
    ["Date of Birth", student.dob?.split("T")[0]],
    ["Father's Name", student.fatherName],
    ["Mother's Name", student.motherName],
    ["Medium of Instruction", student.mediumOfInstruction],
    ["School Name & Place", student.schoolNamePlace],
    ["Religion", student.religion],
    ["Nationality", student.nationality],
    ["Category", student.category],
    ["Date of Admission", student.dateOfAdmission?.split("T")[0]],
    ["Contact No", student.contactNo],
    ["E-mail ID", student.email],
    ["Aadhaar No", student.aadhaar],
    ["Blood Group", student.bloodGroup],
    ["Scholarship Details", student.scholarshipDetails],
    ["Address for Communication", student.address],
  ];

  autoTable(doc, {
    startY: 40,
    margin: { right: 50 },
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 1 },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: "bold" },
      1: { cellWidth: 70 },
    },
    body: studentDetails.map(([l, v]) => [
      l,
      `: ${v ?? ""}`,
    ]),
  });

  let y = doc.lastAutoTable.finalY + 6;

  /*  FEES DETAILS  */

  doc.setFont("times", "bold");
  doc.text("Fee's Details", 15, y);
  y += 3;

  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 9 },
    head: [
      [{ content: "Academic Year Fees", colSpan: 4, styles: { halign: "center" } }],
      ["I", "II", "III", "IV"],
    ],
    body: [[
      fees.feesYear1 ?? "",
      fees.feesYear2 ?? "",
      fees.feesYear3 ?? "",
      fees.feesYear4 ?? "",
    ]],
  });

  y = doc.lastAutoTable.finalY + 6;

  /*  ATTENDANCE  */

  doc.setFont("times", "bold");
  doc.text("Percentage of Attendance (in each Semester)", 15, y);
  y += 3;

  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 9 },
    head: [["I", "II", "III", "IV", "V", "VI", "VII", "VIII"]],
    body: [[
      attendance.attendanceSem1,
      attendance.attendanceSem2,
      attendance.attendanceSem3,
      attendance.attendanceSem4,
      attendance.attendanceSem5,
      attendance.attendanceSem6,
      attendance.attendanceSem7,
      attendance.attendanceSem8,
    ].map(v => v ?? "")],
  });

  y = doc.lastAutoTable.finalY + 6;

  /*  SEMESTER TABLE  */

  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 9 },
    head: [
      [
        { content: "Description", rowSpan: 2 },
        { content: "SEMESTER", colSpan: 8, styles: { halign: "center" } },
      ],
      ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"],
    ],
    body: [
      [
        "Exam Fees",
        semesters.examfeesSem1,
        semesters.examfeesSem2,
        semesters.examfeesSem3,
        semesters.examfeesSem4,
        semesters.examfeesSem5,
        semesters.examfeesSem6,
        semesters.examfeesSem7,
        semesters.examfeesSem8,
      ],
      [
        "Grade Point (GPA)",
        semesters.gpaSem1,
        semesters.gpaSem2,
        semesters.gpaSem3,
        semesters.gpaSem4,
        semesters.gpaSem5,
        semesters.gpaSem6,
        semesters.gpaSem7,
        semesters.gpaSem8,
      ],
      [
        "CGPA",
        semesters.cgpaSem1,
        semesters.cgpaSem2,
        semesters.cgpaSem3,
        semesters.cgpaSem4,
        semesters.cgpaSem5,
        semesters.cgpaSem6,
        semesters.cgpaSem7,
        semesters.cgpaSem8,
      ],
      [
        "Mark Sheet",
        semesters.marksheetSem1,
        semesters.marksheetSem2,
        semesters.marksheetSem3,
        semesters.marksheetSem4,
        semesters.marksheetSem5,
        semesters.marksheetSem6,
        semesters.marksheetSem7,
        semesters.marksheetSem8,
      ],
    ].map(row => row.map(v => v ?? "")),
  });

  doc.save(`${student.name}_Student_Profile.pdf`);
};

  const downloadExcel = () => {
    const wb = XLSX.utils.book_new();

    const sheets = {
      "Personal Details": personalDetails,
      "Fees Details": feesTable,
      Attendance: attendanceTable,
      Semesters: semesterRows.map((s) => [
        s.sem,
        s.examFees,
        s.gpa,
        s.cgpa,
        s.marksheet,
      ]),
    };

    for (const [name, data] of Object.entries(sheets)) {
      const ws = XLSX.utils.aoa_to_sheet([["Field", "Value"], ...data]);
      XLSX.utils.book_append_sheet(wb, ws, name);
    }

    XLSX.writeFile(wb, `${student.name}_Full_Profile.xlsx`);
  };

  const downloadWord = async () => {
    const paragraphs = [
      new Paragraph({
        children: [
          new TextRun({
            text: "PERUNTHALAIVAR KAMARAJAR ARTS COLLEGE",
            bold: true,
            size: 28,
          }),
        ],
        alignment: "center",
      }),
      new Paragraph({
        children: [new TextRun("Department of Commerce")],
        alignment: "center",
      }),
      new Paragraph({
        children: [new TextRun({ text: "STUDENT FULL PROFILE", bold: true })],
        alignment: "center",
        spacing: { after: 300 },
      }),
    ];

    const addSection = (title, arr) => {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: `\n${title}`, bold: true, size: 24 })],
        }),
      );
      arr.forEach(([k, v]) =>
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${k}: `, bold: true }),
              new TextRun(v ? String(v) : "—"),
            ],
          }),
        ),
      );
    };

    addSection("Personal Details", personalDetails);
    addSection("Fees Details", feesTable);
    addSection("Attendance Details", attendanceTable);

    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: "\nSemester Details", bold: true })],
      }),
    );
    semesterRows.forEach((s) =>
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${s.sem}: `, bold: true }),
            new TextRun(
              `Exam Fees: ${s.examFees}, GPA: ${s.gpa}, CGPA: ${s.cgpa}, Marksheet: ${s.marksheet}`,
            ),
          ],
        }),
      ),
    );

    const doc = new Document({ sections: [{ children: paragraphs }] });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${student.name}_Full_Profile.docx`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300">
      <NavInsideBar />
      <div className="flex flex-col items-center pt-8 px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 text-center">
          Student Full Details
        </h2>
        <p className="text-slate-500 mb-6 text-center">
          Detailed record for{" "}
          <span className="font-semibold">{student.name}</span>
        </p>

        {/* Export Buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={downloadPDF}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-800 transition cursor-pointer text-sm"
          >
            Download PDF
          </button>
          <button
            onClick={downloadExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-500 transition cursor-pointer text-sm"
          >
            Download Excel
          </button>
          <button
            onClick={downloadWord}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-500 transition cursor-pointer text-sm"
          >
            Download Word
          </button>
        </div>

        {/* Student Card */}
        <div className="bg-white shadow-2xl rounded-xl p-6 sm:p-10 w-full max-w-5xl mb-10">
          {student.photo && (
            <div className="flex justify-center mb-6">
              <img
                src={student.photo}
                alt="Student"
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-slate-200"
              />
            </div>
          )}

          {/* Personal */}
          <Section title="Personal Details" data={personalDetails} />

          {/* Fees Table */}
          <FeesTableSection title="Fees Details" fees={fees} />

          {/* Attendance Table */}
          <AttendanceSection title="Attendance Details" data={attendance} />

          {/* Semester Table */}
          <SemesterSection title="Semester Details" data={semesterRows} />
        </div>
      </div>
    </div>
  );
};

//  Reusable Components
const Section = ({ title, data }) => (
  <div className="mb-8">
    <h3 className="text-lg font-bold text-slate-800 mb-3">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
      {data.map(([label, value], i) => (
        <div key={i}>
          <p className="text-xs sm:text-sm text-slate-500">{label}</p>
          <p className="text-sm sm:text-base font-semibold text-slate-800 border-b border-slate-200 pb-1 break-words">
            {value}
          </p>
        </div>
      ))}
    </div>
  </div>
);

// implement this table with fetched data
const AttendanceSection = ({ title, data }) => {
  const values = [
    data.attendanceSem1,
    data.attendanceSem2,
    data.attendanceSem3,
    data.attendanceSem4,
    data.attendanceSem5,
    data.attendanceSem6,
    data.attendanceSem7,
    data.attendanceSem8,
  ].map((v) => v ?? "—");

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-slate-800 mb-3">{title}</h3>

      <div className="overflow-x-auto">
        <table className="w-full border border-slate-300 text-sm text-slate-700">
          <thead className="bg-slate-200">
            <tr>
              {["I", "II", "III", "IV", "V", "VI", "VII", "VIII"].map((h) => (
                <th key={h} className="border px-4 py-2 text-center">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {values.map((v, i) => (
                <td key={i} className="border px-4 py-2 text-center">
                  {v}%
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FeesTableSection = ({ title, fees }) => (
  <div className="mb-8">
    <h3 className="text-lg font-bold text-slate-800 mb-3">{title}</h3>

    <div className="overflow-x-auto">
      <table className="w-full border border-slate-300 text-sm text-slate-700">
        <thead className="bg-slate-200">
          <tr>
            {["I", "II", "III", "IV"].map((h) => (
              <th key={h} className="border px-4 py-2 text-center">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-4 py-2 text-center">
              {fees.feesYear1 ?? "—"}
            </td>
            <td className="border px-4 py-2 text-center">
              {fees.feesYear2 ?? "—"}
            </td>
            <td className="border px-4 py-2 text-center">
              {fees.feesYear3 ?? "—"}
            </td>
            <td className="border px-4 py-2 text-center">
              {fees.feesYear4 ?? "—"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const SemesterSection = ({ title, data }) => {
  const row = key => data.map(d => d[key] ?? "—");

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-slate-800 mb-3">{title}</h3>

      <div className="overflow-x-auto">
        <table className="w-full border border-slate-300 text-sm text-slate-700">
          <thead className="bg-slate-200">
            <tr>
              <th rowSpan={2} className="border px-4 py-2 text-center">
                Description
              </th>
              <th colSpan={8} className="border px-4 py-2 text-center">
                SEMESTER
              </th>
            </tr>
            <tr>
              {["I","II","III","IV","V","VI","VII","VIII"].map(h => (
                <th key={h} className="border px-4 py-2 text-center">{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {[
              ["Exam Fees", "examFees"],
              ["Grade Point (GPA)", "gpa"],
              ["CGPA", "cgpa"],
              ["Mark Sheet", "marksheet"],
            ].map(([label, key]) => (
              <tr key={key}>
                <td className="border px-4 py-2 font-semibold text-center">
                  {label}
                </td>
                {row(key).map((v, i) => (
                  <td key={i} className="border px-4 py-2 text-center">
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default ViewSingleStudent;