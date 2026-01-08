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

    if (!date || !name || !description) {
      return res.status(400).json({
        success: false,
        message: "Missing Details",
      });
    }

    const photo1 = req.file ? req.file.buffer : null;
    const photo2 = req.file ? req.file.buffer : null;
    const photo3 = req.file ? req.file.buffer : null;

    if ((photo1 || photo2 || photo3) && Buffer.byteLength((photo1 || photo2 || photo3), "base64") > 500 * 1024) {
      return res
        .status(400)
        .json({ success: false, message: "Photo must be less than 500KB" });
    }

    // const istDate = new Date(date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-');

    const db = (await createDB.getConnection)
      ? await createDB.getConnection()
      : await createDB();

    const insertQuery = `INSERT INTO eventsGallery (
                    name, date, photo1, photo2, photo3, description
                    ) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [
      name ?? null,
      date ?? null,
      photo1 ?? null,
      photo2 ?? null,
      photo3 ?? null,
      description ?? null,
    ];

    await db.execute(insertQuery, params);

    res.json({
      success: true,
      message: "Event Images added successfully.",
    });
  } catch (error) {
    console.log("Error in collegeEventsGalleryController", error);
    res.json({ success: false, message: error.message });
  }
};

// To get events date and event name
export const getCollegeEventsGallery = async (req, res) => {
  try {
    const db = (await createDB.getConnection)
      ? await createDB.getConnection()
      : await createDB();

    // Check for existing events date
    const [AllEvents] = await db.execute("SELECT * FROM eventsGallery");

    res.json({
      success: true,
      message: "Events fetched successfully.",
      AllEvents,
    });
  } catch (error) {
    console.log("Error in getCollegeEventsController", error);
    res.json({ success: false, message: error.message });
  }
};

// To add events details : name, images and all ----> incomplete
export const AddCoursesFiles = async (req, res) => {
  try {
    const { sub_name, file_name, file_desc, file_path } = req.body;

    if (!sub_name || !file_name, !file_desc, !file_path) {
      return res.status(400).json({
        success: false,
        message: "Missing Details",
      });
    }

    const photo1 = req.file ? req.file.buffer : null;
    const photo2 = req.file ? req.file.buffer : null;
    const photo3 = req.file ? req.file.buffer : null;

    if ((photo1 || photo2 || photo3) && Buffer.byteLength((photo1 || photo2 || photo3), "base64") > 500 * 1024) {
      return res
        .status(400)
        .json({ success: false, message: "Photo must be less than 500KB" });
    }

    // const istDate = new Date(date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-');

    const db = (await createDB.getConnection)
      ? await createDB.getConnection()
      : await createDB();

    const insertQuery = `INSERT INTO eventsGallery (
                    name, date, photo1, photo2, photo3, description
                    ) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [
      name ?? null,
      date ?? null,
      photo1 ?? null,
      photo2 ?? null,
      photo3 ?? null,
      description ?? null,
    ];

    await db.execute(insertQuery, params);

    res.json({
      success: true,
      message: "Event Images added successfully.",
    });
  } catch (error) {
    console.log("Error in collegeEventsGalleryController", error);
    res.json({ success: false, message: error.message });
  }
};
