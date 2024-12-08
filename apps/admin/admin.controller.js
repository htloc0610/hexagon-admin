const adminService = require('./admin.service');
const passport = require("passport");


// admin.controller.js

const adminController = {

    async getAllAdmins(req, res) {
        try {
            const admins = await AdminService.getAllAdmins();
            res.status(200).json(admins);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async getAdminById(req, res) {
        try {
            const userId = req.params.id;
        
            const user = await userService.getAdminById(userId);
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
            console.log(req.body);
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
            const currentUser = await userService.getAdminById(userId);
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
    
          const result = await userService.deleteAdmin(userId);
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
    }
}

module.exports = adminController;