const User = require('../models/UserSchema');


const updateUser = async (req, res) => {
    const id =req.params.id;

    try {
        const updateUser = await User.findByIdAndUpdate(id, {$set:req.body},{new:true});
        res.status(200).json({success:true, message: 'User updated successfully', data: updateUser});

    }
    catch (error) {
        res.status(400).json({success:false, error: error.message});
    }

}

const deleteUser = async (req, res) => {
    const id = req.params.id;
    try {
        await User.findByIdAndDelete(id);
        res.status(200).json({success:true, message: 'User deleted successfully'});
    } catch (error) {
        res.status(400).json({success:false, error: error.message});
    }
}
const getSingeUser = async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findById(id).select('-password');
        res.status(200).json({success: true, data: user});
    } catch (error) {
        res.status(400).json({success: false, error: error.message});
    }



}

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}


const userController = {
    updateUser,
    deleteUser,
    getSingeUser,
    getAllUsers,

}
module.exports = userController;