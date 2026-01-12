import createDB from "../config/connection.js";

// To add events date and event name
export const AddCollegeEvents = async (req, res) => {
  try {
    const { date, events } = req.body;

    if (!date || !events) {
      return res.status(400).json({
        success: false,
        message: "Date and Event is required",
      });
    }

    const istDate = new Date(date)
      .toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("/")
      .reverse()
      .join("-");

    const db = (await createDB.getConnection)
      ? await createDB.getConnection()
      : await createDB();

    // Check for existing events date
    const [dates] = await db.execute("SELECT * FROM events WHERE date = ?", [
      istDate ?? null,
    ]);
    if (dates.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Event already exist",
      });
    }

    const insertQuery = `INSERT INTO events (
                    date, events
                    ) VALUES (?, ?)`;
    const params = [istDate ?? null, events ?? null];

    await db.execute(insertQuery, params);

    res.json({
      success: true,
      message: "Event added successfully.",
    });
  } catch (error) {
    console.log("Error in collegeEventsController", error);
    res.json({ success: false, message: error.message });
  }
};

// To get events date and event name
export const getCollegeEvents = async (req, res) => {
  try {
    const db = (await createDB.getConnection)
      ? await createDB.getConnection()
      : await createDB();

    // Check for existing events date
    const [AllEvents] = await db.execute("SELECT * FROM events");

    res.json({
      success: true,
      message: "Event fetch successfully.",
      AllEvents,
    });
  } catch (error) {
    console.log("Error in getCollegeEventsController", error);
    res.json({ success: false, message: error.message });
  }
};

// To add events details : name, images and all
export const AddCollegeEventsGallery = async (req, res) => {
  try {
    const { name, date, description } = req.body;

    if (!name || !date || !description) {
      return res.status(400).json({
        success: false,
        message: "Missing required details",
      });
    }

    // Ensure at least 1 image
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    let photo1 = null;
    let photo2 = null;
    let photo3 = null;

    if (req.files.photo1) {
      photo1 = `/uploads/events/${req.files.photo1[0].filename}`;
    }
    if (req.files.photo2) {
      photo2 = `/uploads/events/${req.files.photo2[0].filename}`;
    }
    if (req.files.photo3) {
      photo3 = `/uploads/events/${req.files.photo3[0].filename}`;
    }

    const db = createDB.getConnection
      ? await createDB.getConnection()
      : await createDB();

    const insertQuery = `
      INSERT INTO eventsGallery
      (name, date, photo1, photo2, photo3, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      name,
      date,
      photo1,
      photo2,
      photo3,
      description,
    ];

    await db.execute(insertQuery, params);

    res.status(201).json({
      success: true,
      message: "Event gallery added successfully",
    });

  } catch (error) {
    console.error("Error in AddCollegeEventsGallery:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Fetch all events
// export const getCollegeEventsGallery = async (req, res) => {
//   let db;

//   try {
//     db = createDB.getConnection
//       ? await createDB.getConnection()
//       : await createDB();

//     // Fetch events ordered by date (latest first)
//     const [events] = await db.execute(`
//       SELECT 
//         id,
//         name,
//         date,
//         description,
//         photo1,
//         photo2,
//         photo3
//       FROM eventsGallery
//       ORDER BY date DESC
//     `);

//     return res.status(200).json({
//       success: true,
//       message: "Events fetched successfully",
//       events
//     });

//   } catch (error) {
//     console.error("Error in getCollegeEventsGallery:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch events",
//     });
//   }
// };

// Fetch ONLY recent 10 events (latest first)
export const getCollegeEventsGallery = async (req, res) => {
  let db;

  try {
    db = createDB.getConnection
      ? await createDB.getConnection()
      : await createDB();

    // Fetch ONLY recent 10 events (latest first)
    const [events] = await db.execute(`
      SELECT 
        id,
        name,
        date,
        description,
        photo1,
        photo2,
        photo3
      FROM eventsGallery
      ORDER BY date DESC
      LIMIT 10
    `);

    return res.status(200).json({
      success: true,
      message: "Recent events fetched successfully",
      events,
    });

  } catch (error) {
    console.error("Error in getCollegeEventsGallery:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
};

// Add courses -> only pdfs
export const AddCoursesFiles = async (req, res) => {
  try {
    const { sub_name, file_name, file_desc } = req.body;

    if (!sub_name || !file_name || !file_desc || !req.file) {
      return res.status(400).json({
        success: false,
        message: "All fields and PDF file are required",
      });
    }

    const storedFilePath = `/uploads/courses/${req.file.filename}`;

    const db = (await createDB.getConnection)
      ? await createDB.getConnection()
      : await createDB();

    const insertQuery = `
      INSERT INTO course_files (
        sub_name,
        file_name,
        file_desc,
        file_path,
        file_type
      ) VALUES (?, ?, ?, ?, ?)
    `;

    const params = [
      sub_name,
      file_name,        
      file_desc,
      storedFilePath,   
      "pdf",
    ];

    await db.execute(insertQuery, params);

    res.status(201).json({
      success: true,
      message: "Course PDF uploaded successfully",
      data: {
        sub_name,
        file_name,
        file_path: storedFilePath,
      },
    });

  } catch (error) {
    console.error("Error in AddCoursesFiles:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get courses files
export const getCoursesFiles = async (req, res) => {
  try {
    const { sub_name } = req.params;

    if (!sub_name) {
      return res.status(400).json({
        success: false,
        message: "Subject name (sub_name) is required",
      });
    }

    const db = (await createDB.getConnection)
      ? await createDB.getConnection()
      : await createDB();

    const query = `
      SELECT 
        id,
        sub_name,
        file_name,
        file_desc,
        file_path,
        file_type,
        uploaded_at
      FROM course_files
      WHERE sub_name = ?
      ORDER BY uploaded_at DESC
    `;

    const [files] = await db.execute(query, [sub_name]);

    res.status(200).json({
      success: true,
      message: "Course files fetched successfully",
      count: files.length,
      files,
    });

  } catch (error) {
    console.error("Error in getCoursesFiles:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




