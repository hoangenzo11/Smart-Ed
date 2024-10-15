const Tutor = require("../models/TutorSchema");

const submitApplication = async (req, res) => {
  const { specialization, qualifications, experiences } = req.body;
  const id = req.params.id; // Get tutor ID from URL parameters

  try {
    console.log("Tutor ID:", id);
    console.log("Request Body:", req.body);

    const tutor = await Tutor.findByIdAndUpdate(
      id,
      { specialization, qualifications, experiences, isApproved: "pending" },
      { new: true }
    );

    if (!tutor) {
      return res.status(400).json({ success: false, error: "Tutor not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Application submitted", data: tutor });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const updateTutorApproval = async (req, res) => {
  const { action, price } = req.body;
  let isApproved;

  if (action === "accept") {
    if (!price) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Price is required when accepting a tutor",
        });
    }
    isApproved = "approved";
  } else if (action === "reject") {
    isApproved = "cancelled";
  } else {
    return res.status(400).json({ success: false, message: "Invalid action" });
  }

  try {
    const updateData = { isApproved };
    if (isApproved === "approved") {
      updateData.price = price;
    }

    const tutor = await Tutor.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    res
      .status(200)
      .json({ success: true, message: `Tutor ${isApproved}`, data: tutor });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const updateTutor = async (req, res) => {
  const id = req.params.id;

  try {
    const updateTutor = await Tutor.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );
    console.log("Update Tutor:", updateTutor);
    res
      .status(200)
      .json({
        success: true,
        message: "Tutor updated successfully",
        data: updateTutor,
      });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const deleteTutor = async (req, res) => {
  const id = req.params.id;
  try {
    await Tutor.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Tutor deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getSingeTutor = async (req, res) => {
  const id = req.params.id;
  try {
    const tutor = await Tutor.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "user",
          select: "name photo",
        },
      })
      .select("-password");
    res.status(200).json({ success: true, data: tutor });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const searchTutorByName = async (req, res) => {
  const { name, minPrice, maxPrice, specialization } = req.query;

  if (!name) {
    return res
      .status(400)
      .json({ success: false, error: "Name query parameter is required" });
  }

  const query = {
    name: { $regex: name, $options: "i" },
    isApproved: "approved",
  };

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = minPrice;
    if (maxPrice) query.price.$lte = maxPrice;
  }

  if (specialization) {
    query.specialization = specialization;
  }

  try {
    const tutors = await Tutor.find(query).select("-password");
    if (tutors.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No tutors found" });
    }
    res.status(200).json({ success: true, data: tutors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
const getAllTutors = async (req, res) => {
  try {
    const { query } = req.query;
    let tutors;
    if (query) {
      tutors = await Tutor.find({
        isApproved: "approved",
        $or: [
          { name: { $regex: query, $options: "i" } },
          { specialization: { $regex: query, $options: "i" } },
        ],
      })
        .populate({
          path: "reviews",
          populate: {
            path: "user",
            select: "name photo",
          },
        })
        .select("-password");
    } else {
      tutors = await Tutor.find({ isApproved: "approved" })
        .populate({
          path: "reviews",
          populate: {
            path: "user",
            select: "name photo",
          },
        })
        .select("-password");
    }

    res.status(200).json({ success: true, data: tutors });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
const getAllApplications = async (req, res) => {
  try {
    const applications = await Tutor.find({ isApproved: "pending" }).select(
      "-password"
    );
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
const TutorController = {
  submitApplication,
  updateTutorApproval,
  updateTutor,
  deleteTutor,
  getSingeTutor,
  searchTutorByName,
  getAllTutors,
  getAllApplications,
};

module.exports = TutorController;
