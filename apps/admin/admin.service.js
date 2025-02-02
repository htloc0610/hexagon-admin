const bcrypt = require("bcrypt");
const Admin = require("./admin.model");
const { Op } = require("sequelize");
const User = require("../users/user.model");
const moment = require("moment");

const adminService = {

    // Tạo người dùng mới
    async createAdmin(userData) {
        try {
        const hashedPassword = await bcrypt.hash(userData.password, 10); // Mã hóa mật khẩu
        const verificationToken = await bcrypt.genSalt(10);
        const newUser = await Admin.create({
            ...userData,
            verificationToken: verificationToken,
            password: hashedPassword, // Lưu mật khẩu đã mã hóa
        });
        // emailHelper.sendVerificationEmail(newUser.email, verificationToken);
        return newUser;
        } catch (error) {
        throw new Error("Error creating user: " + error.message);
        }
    },
    async getPaginatedAdmins(offset, limit) {
        try {
            const admins = await Admin.findAll({ offset, limit }); // Retrieve paginated admin records from the database
            return admins;
        } catch (error) {
            throw new Error('Error retrieving paginated admins: ' + error.message);
        }
    },

    async fetchAccounts(offset, limit, filterName, filterEmail, sortKey, sortOrder) {
        try {
            // console.log('fetchAccounts');
            const whereClause = {};
            if (filterName) whereClause.username = { [Op.like]: `%${filterName}%` };
            if (filterEmail) whereClause.email = { [Op.like]: `%${filterEmail}%` };
    
            const orderClause = sortKey && sortKey !== 'role' ? [[sortKey, sortOrder || 'asc']] : [];

    
            const admins = await Admin.findAll({ where: whereClause, order: orderClause });
            const users = await User.findAll({ where: whereClause, order: orderClause });
    
            const adminData = admins.map(admin => ({
                ...admin.dataValues,
                role: 'Admin',
                createdAt: moment(admin.dataValues.createdAt).format('DD/MM/YYYY, h:mm:ss a'),
            }));
    
            const userData = users.map(user => ({
                ...user.dataValues,
                role: 'User',
                createdAt: moment(user.dataValues.createdAt).format('DD/MM/YYYY, h:mm:ss a'),
            }));
    
            const combinedData = [...adminData, ...userData];
    
            if (sortKey === 'role') {
                combinedData.sort((a, b) => {
                    if (sortOrder === 'desc') {
                        return b.role.localeCompare(a.role);
                    }
                    return a.role.localeCompare(b.role);
                });
            } else if (sortKey === 'createdAt') {
                combinedData.sort((a, b) => { 
                    return sortOrder === 'desc' ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt);
                });
            }
            const result = combinedData.slice(offset, limit + offset);
            return result;
        } catch (error) {
            throw new Error(error.message);
        }
    },
    
    // Tạo người dùng từ thông tin lấy từ email
    // async createUserEmail(userData) {
    //     try {
    //     const randomPassword = Math.random().toString(36).slice(-8); // Tạo mật khẩu ngẫu nhiên
    //     const hashedPassword = await bcrypt.hash(randomPassword, 10); // Mã hóa mật khẩu
    //     const newUser = await User.create({
    //         ...userData,
    //         password: hashedPassword, // Lưu mật khẩu đã mã hóa
    //     });
    //     return newUser;
    //     } catch (error) {
    //     throw new Error("Error creating user: " + error.message);
    //     }
    // },

    async getAllAdmins() {
        try {
            const admins = await Admin.findAll(); // Retrieve all admin records from the database
            return admins;
        } catch (error) {
            throw new Error('Error retrieving admins: ' + error.message);
        }
    },

    // Lấy người dùng theo id
    async getAdminById(userId) {
        try {
            const user = await Admin.findByPk(userId); // Sử dụng primary key (id) để tìm người dùng
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw new Error('Error fetching user: ' + error.message);
        }
    },

    // Lấy người dùng theo email
    async getAdminByEmail(email) {
        try {
            const user = await Admin.findOne({ where: { email } });
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw new Error('Error fetching user by email: ' + error.message);
        }
    },

    // Lấy người dùng theo email
    async getAdminByUsername(username) {
        try {
            const user = await Admin.findOne({ where: { username } });
            return user;
        } catch (error) {
            throw new Error('Error fetching user by email: ' + error.message);
        }
    },

    // Cập nhật thông tin người dùng
    async updateAdmin(userId, updateData) {
        try {
            const user = await Admin.findByPk(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Nếu có mật khẩu mới và mật khẩu không rỗng, mã hóa mật khẩu trước khi cập nhật
            if (updateData.password && updateData.password.trim() !== '') {
                updateData.password = await bcrypt.hash(updateData.password, 10);
            } else {
                delete updateData.password; // Xóa trường password nếu mật khẩu rỗng
            }

            await user.update(updateData);
            return user;
        } catch (error) {
            throw new Error('Error updating user: ' + error.message);
        }
    },

    // Xóa người dùng
    async deleteAdmin(userId) {
        try {
            const user = await Admin.findByPk(userId);
            if (!user) {
                throw new Error('User not found');
            }

            await user.destroy();
            return { message: 'User deleted successfully' };
        } catch (error) {
            throw new Error('Error deleting user: ' + error.message);
        }
    },

    // Kiểm tra tên người dùng có tồn tại không
    async checkIfUsernameExists(username) {
        try {
            const user = await Admin.findOne({ where: { username } });
            return user !== null;
        } catch (error) {
            throw new Error('Error checking username: ' + error.message);
        }
    },

    // Kiểm tra email đã tồn tại không
    async checkIfEmailExists(email) {
        try {
            const user = await Admin.findOne({ where: { email } });
            return user !== null;
        } catch (error) {
            throw new Error('Error checking email: ' + error.message);
        }
    },

    // Xác thực mật khẩu người dùng
    async validatePassword(inputPassword, storedPassword) {
        try { 
            const isMatch = await bcrypt.compare(inputPassword, storedPassword);
            return isMatch;
        } catch (error) {
            throw new Error('Error validating password: ' + error.message);
        }
    },

    // Xác minh tài khoản
    // async verifyAccount(token) {
    //     try {
    //     // Tìm người dùng
    //     const user = await User.findOne({ where: { verificationToken: token } });
    //     if (!user) {
    //         return { error: "Invalid or expired token." };
    //     }
    //     if (user.isDeleted) {
    //         return { error: "User account is deleted." };
    //     }
    //     // Cập nhật trạng thái xác minh
    //     user.isVerify = true;
    //     user.verificationToken = null; // Xóa token sau khi xác minh
    //     await user.save();

    //     return { message: "Email verification successful!" };
    //     } catch (err) {
    //     return { error: err.message };
    //     }
    // },

    async forgotPassword(email) {
        try {
        const user = await Admin.findOne({
            where: { email: email },
        });
        if (!user) {
            return { message: "User not found" };
        }

        const token = await bcrypt.genSalt(10);
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 900000; // 15 minutes
        await user.save();

        await emailHelper.sendResetPasswordEmail(user.email, token);
        return { message: "Password reset email sent" };
        } catch (error) {
        return { message: "Internal server error" };
        }
    },

    async resetPassword(token, newPassword) {
        try {
        const user = await Admin.findOne({
            where: {
            resetPasswordToken: token,
            resetPasswordExpires: { [Op.gt]: Date.now() },
            },
        });

        if (!user) {
            return { message: "Invalid token" };
        }

        if (!user.isVerify) {
            return { error: "User account is not verify." };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = null; // Xóa token
        user.resetPasswordExpires = null; // Xóa thời gian hết hạn
        await user.save();

        return { message: "Password reset successful" };
        } catch (error) {
        console.error("Error resetting password:", error);
        return { message: "Internal server error" };
        }
    },
    async banUser(userId) {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // console.log(user); 

            user.isBanned = true;
            await user.save();

            return { message: 'User banned successfully' };
        } catch (error) {
            console.error('Error banning user:', error);
            throw new Error('Error banning user');
        }
    },

    async unbanUser(userId) {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error('User not found');
            }

            user.isBanned = false;
            await user.save();

            return { message: 'User unbanned successfully' };
        } catch (error) {
            console.error('Error unbanning user:', error);
            throw new Error('Error unbanning user');
        }
    },
};

module.exports = adminService;
