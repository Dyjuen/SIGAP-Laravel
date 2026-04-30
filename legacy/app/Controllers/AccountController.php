<?php

namespace App\Controllers;

use App\Core\Response;
use App\Models\User;
use App\Validators\ProfileValidator;

class AccountController
{
    private $userModel;

    public function __construct()
    {
        $this->userModel = new User;
    }

    /**
     * Get authenticated user profile
     *
     * GET /api/account/profile
     * Header: Authorization: Bearer <token>
     */
    public function getProfile()
    {
        // Get authenticated user from helper function
        $authUser = auth_user();

        if (! $authUser) {
            Response::unauthorized('User tidak terautentikasi.');
        }

        $userId = $authUser['user_id'];

        // Get user with roles
        $user = $this->userModel->getUserWithRoles($userId);

        if (! $user) {
            Response::notFound('User tidak ditemukan.');
        }

        Response::success($user, 'Data profile berhasil diambil.');
    }

    /**
     * Get all user profiles (Admin only)
     *
     * GET /api/admin/users
     * Header: Authorization: Bearer <token>
     */
    public function getAllProfiles()
    {
        try {
            $users = $this->userModel->getAllUsersWithRoles();
            Response::success($users, 'Semua data profile berhasil diambil.');
        } catch (\Exception $e) {
            Response::serverError('Gagal mengambil data profiles: '.$e->getMessage());
        }
    }

    /**
     * Update user profile by ID (Admin only)
     *
     * PUT /api/admin/users/{id}
     * Header: Authorization: Bearer <token>
     * Body: { nama_lengkap, email, role_id }
     */
    public function updateUser($userId)
    {
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);

        // Validate required fields
        $rules = [
            'nama_lengkap' => 'required|min:3|max:100',
            'email' => 'required|email|max:100',
            'role_id' => 'required|integer', // Expecting a single role ID
        ];

        $validator = new ProfileValidator;
        if (! $validator->validate($input, $rules)) {
            Response::validationError($validator->getErrors(), 'Validasi gagal.');
        }

        // Check if user exists
        $user = $this->userModel->findById($userId);
        if (! $user) {
            Response::notFound('User tidak ditemukan.');
        }

        // Check email uniqueness
        if ($this->userModel->emailExists($input['email'], $userId)) {
            Response::validationError([
                'email' => ['Email sudah digunakan oleh user lain.'],
            ], 'Validasi gagal.');
        }

        try {
            // Update profile
            $updateData = [
                'nama_lengkap' => $input['nama_lengkap'],
                'email' => $input['email'],
            ];

            $this->userModel->updateProfile($userId, $updateData);

            // Update role using role_id
            $this->userModel->updateUserRole($userId, $input['role_id']);

            // Get updated user
            $updatedUser = $this->userModel->getUserWithRoles($userId);

            Response::success($updatedUser, 'Profile user berhasil diupdate.');

        } catch (\Exception $e) {
            Response::serverError('Gagal update profile user: '.$e->getMessage());
        }
    }

    /**
     * Change user password by ID (Admin only)
     *
     * PUT /api/admin/users/{id}/change-password
     * Header: Authorization: Bearer <token>
     * Body: { new_password, new_password_confirmation }
     */
    public function adminChangePassword($userId)
    {
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);

        // Validate required fields
        $rules = [
            'new_password' => 'required|min:8|max:100',
            'new_password_confirmation' => 'required',
        ];

        $validator = new ProfileValidator;
        if (! $validator->validate($input, $rules)) {
            Response::validationError($validator->getErrors(), 'Validasi gagal.');
        }

        // Check if new password matches confirmation
        if ($input['new_password'] !== $input['new_password_confirmation']) {
            Response::validationError([
                'new_password_confirmation' => ['Konfirmasi password tidak sama.'],
            ], 'Validasi gagal.');
        }

        // Check if user exists
        $user = $this->userModel->findById($userId);
        if (! $user) {
            Response::notFound('User tidak ditemukan.');
        }

        try {
            // Update password
            $this->userModel->updatePassword($userId, $input['new_password']);

            Response::success(null, 'Password user berhasil diubah.');

        } catch (\Exception $e) {
            Response::serverError('Gagal ubah password user: '.$e->getMessage());
        }
    }

    /**
     * Delete user by ID (Admin only)
     *
     * DELETE /api/admin/users/{id}
     * Header: Authorization: Bearer <token>
     */
    public function deleteUser($userId)
    {
        // Get authenticated user
        $authUser = auth_user();
        if (! $authUser) {
            Response::unauthorized('User tidak terautentikasi.');
        }

        // Prevent admin from deleting their own account
        if ((int) $userId === (int) $authUser['user_id']) {
            Response::forbidden('Admin tidak dapat menghapus akunnya sendiri.');
        }

        // Check if user exists
        $user = $this->userModel->findById($userId);
        if (! $user) {
            Response::notFound('User tidak ditemukan.');
        }

        try {
            // Delete user
            $this->userModel->deleteUser($userId);
            Response::success(null, 'User berhasil dihapus.');
        } catch (\Exception $e) {
            Response::serverError('Gagal menghapus user: '.$e->getMessage());
        }
    }
}
