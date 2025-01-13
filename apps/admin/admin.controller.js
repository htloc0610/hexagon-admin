const moment = require('moment');
const adminService = require('./admin.service');
const passport = require("passport");
const userService = require('../users/user.service');


// admin.controller.js

const adminController = {

    async getAllAdmins(req, res) {
        try {
            const admins = await adminService.getAllAdmins();
            const adminData = admins.map(admin => admin.dataValues); // Extract dataValues
            return adminData; // Return the extracted data
        } catch (error) {
            throw new Error(error.message); // Throw the error to be caught in the route handler
        }
    },

    async getAllAccounts(req, res) {
        try {
            const admins = await adminService.getAllAdmins();
            const users = await userService.getAllUsers(); // Assuming you have a method to get all users
            const adminData = admins.map(admin => ({ ...admin.dataValues, role: 'Admin' })); // Extract dataValues for admins and add role
            const userData = users.map(user => ({ ...user.dataValues, role: 'User' })); // Extract dataValues for users and add role
            const accounts = [...adminData, ...userData]; // Combine admin and user data
            return accounts; // Return the combined data
        } catch (error) {
            throw new Error(error.message); // Throw the error to be caught in the route handler
        }
    },

    async getAccountById(id) {
        // console.log('id', id);
        try {
            const admin = await adminService.getAdminById(id);
            if (admin) {
                return { ...admin.dataValues, role: 'Admin' };
            }
        } catch (error) {
        }

        try {
            const user = await userService.getUserById(id);
            if (user) {
                return { ...user.dataValues, role: 'User' };
            }
        } catch (error) {
            throw new Error('Account not found');
        }
    },

    async getAccountByIdAndRole(id, role) {
        try {
            if (role === 'Admin') {
                const admin = await adminService.getAdminById(id);
                if (admin) {
                    return { ...admin.dataValues, role: 'Admin' };
                }
            } else if (role === 'User') {
                const user = await userService.getUserById(id);
                if (user) {
                    return { ...user.dataValues, role: 'User' };
                }
            }
            throw new Error('Account not found');
        } catch (error) {
            throw new Error('Account not found');
        }
    },


    async getPaginatedAccounts(offset, limit, filterName, filterEmail, sortKey, sortOrder) {
        try {
            console.log('Fetching accounts with parameters:', { offset, limit, filterName, filterEmail, sortKey, sortOrder });
    
            const accounts = await adminService.fetchAccounts(
                offset,
                limit,
                filterName,
                filterEmail,
                sortKey,
                sortOrder
            );
    
            return accounts;
        } catch (error) {
            console.error('Error fetching accounts:', error.message);
            throw new Error(error.message); // Quăng lỗi để router xử lý
        }
    },
    

    async getAdminById(req, res) {
        try {
            const userId = req.params.id;
        
            const user = await adminService.getAdminById(userId);
            return res.status(200).json({
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                url: user.url,
            });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Server error" });
        }
    },

    async createAdmin(req, res) {
        try {
            // Lấy dữ liệu từ request body
            const { username, email, password, firstName, lastName, url } = req.body;

            // Kiểm tra xem tên người dùng hoặc email đã tồn tại chưa
            if (await adminService.checkIfUsernameExists(username)) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            if (await adminService.checkIfEmailExists(email)) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            // Tạo người dùng mới
            const newUser = await adminService.createAdmin({ username, email, password, firstName, lastName, url });

            // Trả về kết quả
            return res.status(201).json({
                message: 'User created successfully',
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    url: newUser.url,
                }
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }
    },

    async updateAdmin(req, res) {
        try {
            const userId = req.user.id; // Get user ID from authenticated session
            const { username, email, firstName, lastName, profileImgUrl } = req.body;
  
            // Fetch the current user data
            const currentUser = await adminService.getAdminById(userId);
            let imageUrl = currentUser.url;
  
            if (profileImgUrl) {
                imageUrl = profileImgUrl; // Set the imageUrl from the request body
            }
  
            // Prepare the update data
            const updateData = {
                username,
                email,
                firstName,
                lastName,
                url: imageUrl
            };
  
  
            // Update the user
            const updatedUser = await adminService.updateAdmin(userId, updateData);
  
            // Update the user session
            req.login(updatedUser, (err) => {
                if (err) {
                    console.error('Error updating session:', err);
                    return res.status(500).json({ errorMessage: 'Server error' });
                }
  
                // Return the updated user information
                return res.status(200).json({
                    successMessage: 'User updated successfully',
                    user: {
                        id: updatedUser.id,
                        username: updatedUser.username,
                        email: updatedUser.email,
                        firstName: updatedUser.firstName,
                        lastName: updatedUser.lastName,
                        profileImg: updatedUser.url,
                    }
                });
            });
        } catch (error) {
            console.error('Error updating user:', error);
            return res.status(500).json({ errorMessage: 'Server error' });
        }
    },

    async deleteAdmin(req, res) {
        try {
          const userId = req.params.id;
    
          const result = await adminService.deleteAdmin(userId);
          return res.status(200).json(result);
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Server error" });
        }
    },

    async loginAdmin(req, res, next) {
        passport.authenticate("local", (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(401).json({ message: info.message });
            }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                // Đăng nhập thành công, chuyển hướng tới trang /
                return res.redirect('/');
            });
        })(req, res, next);
    },
    
    async logoutAdmin(req, res) {
        req.logout(() => {
          res.redirect("/login");
        });
    },

    // Cập nhật mật khẩu
    async changePassword(req, res) {
        try {
            const userId = req.user.id; // Get user ID from authenticated session
            const { oldPassword, newPassword } = req.body;

            // Fetch the current user data
            const currentUser = await adminService.getAdminById(userId);

            // Check if the old password matches the current password
            
            if (!await adminService.validatePassword(oldPassword, currentUser.password)) {
                return res.status(400).json({ message: 'Incorrect password' });
            }
            // Check if the new password is different from the old password
            if (oldPassword === newPassword) {
                return res.status(400).json({ message: 'New password must be different from the old password' });
            }
            
            password = newPassword;
            const updateData = { password };

            

            // Update the user information
            const updatedUser = await adminService.updateAdmin(userId, updateData);

            // Re-authenticate the user to update the session
            req.logIn(updatedUser, function(err) {
                if (err) {
                    console.error('Error re-authenticating user:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                // Return the updated user information
                return res.status(200).json({
                    successMessage: 'User updated successfully',
                    user: {
                        id: updatedUser.id,
                        username: updatedUser.username,
                        email: updatedUser.email,
                        firstName: updatedUser.firstName,
                        lastName: updatedUser.lastName,
                        profileImg: updatedUser.profileImg,
                    }
                });
            });

        } catch (error) {
            console.error('Error updating user:', error);
            return res.status(500).json({ errorMessage: 'Server error' });
        }
    },
    async banUser(req, res) {
        try {
            const userId = req.params.id;
            await adminService.banUser(userId);
            res.json({ message: "User banned successfully" });
        } catch (error) {
            console.error('Error banning user:', error);
            res.status(500).json({ message: error.message });
        }
    },

    async unbanUser(req, res) {
        try {
            const userId = req.params.id;
            await adminService.unbanUser(userId);
            res.json({ message: "User unbanned successfully" });
        } catch (error) {
            console.error('Error unbanning user:', error);
            res.status(500).json({ message: error.message });
        }
    },

}

module.exports = adminController;