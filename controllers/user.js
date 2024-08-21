import User from "../models/user.js";
import { uniqId } from "../uniqId.js";

const userRegister = async (req, res) => {
  try {
    const {
      name,
      fatherName,
      dob,
      gender,
      email,
      mobileNumber,
      adhaarNumber,
      voterId,
      district,
      constituency,
      address,
    } = req.body;

    // Check if Aadhaar number already exists
    const aldreadyAadharExist = await User.findOne({ adhaarNumber });

    if (aldreadyAadharExist) {
      return res
        .status(400)
        .json({ message: "Aadhaar number is already registered" });
    }

    // Check if all required fields are provided
    if (
      !name ||
      !fatherName ||
      !dob ||
      !gender ||
      !mobileNumber ||
      !adhaarNumber ||
      !voterId ||
      !district ||
      !constituency ||
      !address
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const allUsers = await User.find({});

    // Generate a unique referral ID for the new user
    const referralId = await uniqId();

    // Use the mobile number for referral logic
    let referredBy = req.body.referredBy;

    const referralUser = await User.findOne({
      mobileNumber: req.body.referredBy,  // Change this to mobileNumber
    });

    if (!referralUser) {
      referredBy = "";
    }

    // Create a new user
    const newUser = new User({
      name,
      fatherName,
      dob,
      gender,
      email,
      mobileNumber,
      adhaarNumber,
      voterId,
      district,
      constituency,
      address,
      referralId,
      referredBy,
    });

    // Update the referred user's referredPeoples array
    for (const singleUser of allUsers) {
      if (singleUser.mobileNumber === referredBy) {  // Change this to mobileNumber
        singleUser.referredPeoples.push(referralId);
        await singleUser.save();
      }
    }

    const savedUser = await newUser.save();
    return res.status(200).json(savedUser);
  } catch (err) {
    console.error("Error saving user:", err);
    if (err.code === 11000 && err.keyPattern && err.keyPattern.adhaarNumber) {
      res.status(400).json({ message: "Aadhaar number is already registered" });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
};


const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export { userRegister, getAllUsers };
