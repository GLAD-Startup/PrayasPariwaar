"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  FileCheck2,
  Sparkles,
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "VOLUNTEER" | "DONOR" | "USER";
  phone?: string | null;
  city?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts: number;
    projects: number;
    donations: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Create User Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EDITOR",
    phone: "",
    city: "Vrindavan",
    isActive: true,
  });

  // Password Reset Modal State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetUserName, setResetUserName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);

  // Auto-dismiss toasts
  useEffect(() => {
    if (!toastMsg) return;
    const timer = setTimeout(() => setToastMsg(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMsg]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery.trim()) queryParams.set("search", searchQuery.trim());
      if (roleFilter !== "ALL") queryParams.set("role", roleFilter);
      if (statusFilter !== "ALL") queryParams.set("status", statusFilter);

      const res = await apiFetch(`/api/users?${queryParams.toString()}`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.data || []);
      } else {
        setToastMsg({ text: json.error || "Failed to load user directory", type: "error" });
      }
    } catch (e: any) {
      console.error(e);
      setToastMsg({ text: "Could not connect to user API", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle User Creation
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) errors.name = "Full name is required";
    if (!formData.email.trim() || !formData.email.includes("@")) {
      errors.email = "Valid email address is required";
    }
    if (!formData.password || formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setSubmitting(true);

    try {
      const res = await apiFetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setToastMsg({
          text: `User account for "${json.data.name}" created successfully!`,
          type: "success",
        });
        setCreateModalOpen(false);
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "EDITOR",
          phone: "",
          city: "Vrindavan",
          isActive: true,
        });
        fetchUsers();
      } else {
        setFormErrors({ general: json.error || "Failed to create user" });
      }
    } catch (err: any) {
      setFormErrors({ general: "A network error occurred while creating user" });
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle user status (Active / Suspended)
  const handleToggleStatus = async (user: AdminUser) => {
    const nextStatus = !user.isActive;
    setActionLoading(user.id);

    try {
      const res = await apiFetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextStatus }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: nextStatus } : u))
        );
        setToastMsg({
          text: `User ${user.name} has been ${nextStatus ? "activated" : "suspended"}`,
          type: "success",
        });
      } else {
        setToastMsg({ text: json.error || "Could not update status", type: "error" });
      }
    } catch (err) {
      setToastMsg({ text: "Failed to update user status", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  // Quick Role change
  const handleRoleChange = async (user: AdminUser, newRole: string) => {
    if (user.role === newRole) return;
    setActionLoading(user.id);

    try {
      const res = await apiFetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: newRole as any } : u))
        );
        setToastMsg({
          text: `Role for ${user.name} changed to ${newRole}`,
          type: "success",
        });
      } else {
        setToastMsg({ text: json.error || "Could not update role", type: "error" });
      }
    } catch (err) {
      setToastMsg({ text: "Failed to update user role", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  // Password reset submit
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUserId || !newPassword || newPassword.length < 6) return;

    setResetSubmitting(true);
    try {
      const res = await apiFetch(`/api/users/${resetUserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setToastMsg({
          text: `Password for ${resetUserName} reset successfully!`,
          type: "success",
        });
        setResetModalOpen(false);
        setNewPassword("");
        setResetUserId(null);
      } else {
        setToastMsg({ text: json.error || "Password reset failed", type: "error" });
      }
    } catch (err) {
      setToastMsg({ text: "Failed to reset password", type: "error" });
    } finally {
      setResetSubmitting(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (user: AdminUser) => {
    if (!confirm(`Are you sure you want to permanently delete user "${user.name}" (${user.email})?`)) {
      return;
    }

    setActionLoading(user.id);
    try {
      const res = await apiFetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        setToastMsg({ text: json.message || "User deleted successfully", type: "success" });
      } else {
        setToastMsg({ text: json.error || "Failed to delete user", type: "error" });
      }
    } catch (err) {
      setToastMsg({ text: "Failed to delete user account", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  // Role Badge Color & Label Helper
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return {
          label: "Administrator",
          classes: "bg-purple-50 text-purple-800 border-purple-200",
          icon: ShieldCheck,
        };
      case "EDITOR":
        return {
          label: "Content Editor",
          classes: "bg-blue-50 text-blue-800 border-blue-200",
          icon: Edit2,
        };
      case "VOLUNTEER":
        return {
          label: "Volunteer Staff",
          classes: "bg-emerald-50 text-emerald-800 border-emerald-200",
          icon: UserCheck,
        };
      case "DONOR":
        return {
          label: "Verified Donor",
          classes: "bg-amber-50 text-amber-800 border-amber-200",
          icon: Sparkles,
        };
      default:
        return {
          label: "App User",
          classes: "bg-slate-50 text-slate-700 border-slate-200",
          icon: User,
        };
    }
  };

  // Computed stats
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const editorCount = users.filter((u) => u.role === "EDITOR").length;
  const volunteerCount = users.filter((u) => u.role === "VOLUNTEER").length;
  const activeCount = users.filter((u) => u.isActive).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs sm:text-sm font-semibold transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
            toastMsg.type === "success"
              ? "bg-emerald-950 text-emerald-100 border-emerald-700"
              : "bg-rose-950 text-rose-100 border-rose-700"
          }`}
        >
          {toastMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMsg.text}</span>
          <button
            onClick={() => setToastMsg(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Quick Action */}
      <div className="border-b border-prayas-rule pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Users className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-prayas-neem">
              System Access & Security
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink mt-1">
            Admin & Staff User Management
          </h1>
          <p className="text-xs sm:text-sm text-prayas-muted mt-1">
            Manage authenticated administrators, editorial staff, and volunteer coordinators.
          </p>
        </div>

        <button
          onClick={() => {
            setFormErrors({});
            setCreateModalOpen(true);
          }}
          className="px-5 py-2.5 bg-[#2E5339] hover:bg-[#23432b] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Create New User</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-prayas-rule shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 block">Total Users</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-mono">{totalCount}</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {activeCount} Active
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-prayas-rule shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-purple-700 block">Administrators</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-mono">{adminCount}</span>
            <span className="text-[10px] text-purple-600 font-medium">Full Access</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-prayas-rule shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-blue-700 block">Content Editors</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-mono">{editorCount}</span>
            <span className="text-[10px] text-blue-600 font-medium">News & Gallery</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-prayas-rule shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-emerald-700 block">Volunteer Staff</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-mono">{volunteerCount}</span>
            <span className="text-[10px] text-emerald-600 font-medium">Field Portal</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white border border-prayas-rule rounded-xl shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-prayas-rule rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E5339]/20 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-prayas-rule rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2E5339]/20"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Administrators</option>
            <option value="EDITOR">Content Editors</option>
            <option value="VOLUNTEER">Volunteers</option>
            <option value="DONOR">Donors</option>
            <option value="USER">App Users</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-prayas-rule rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2E5339]/20"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Suspended Only</option>
          </select>

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 border border-prayas-rule rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="bg-white border border-prayas-rule rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-prayas-rule text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              <tr>
                <th className="px-5 py-3.5">User Details</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 hidden md:table-cell">Contact & City</th>
                <th className="px-5 py-3.5 hidden lg:table-cell">Registered</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-prayas-rule">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#2E5339]" />
                    <span className="text-xs">Loading user directory...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 space-y-2">
                    <Users className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-semibold text-slate-700">No users found</p>
                    <p className="text-xs text-slate-400">Try changing your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  const RoleIcon = roleBadge.icon;
                  const isOperating = actionLoading === user.id;

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        !user.isActive ? "opacity-60 bg-slate-50/40" : ""
                      }`}
                    >
                      {/* User Column */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center justify-center font-bold text-xs shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block leading-snug">
                              {user.name}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono block">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Column */}
                      <td className="px-5 py-4">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 ${roleBadge.classes}`}
                          >
                            <RoleIcon className="w-3 h-3" />
                            <span>{roleBadge.label}</span>
                          </span>

                          {/* Quick Role Dropdown */}
                          <select
                            value={user.role}
                            disabled={isOperating}
                            onChange={(e) => handleRoleChange(user, e.target.value)}
                            className="text-[11px] bg-transparent border-0 text-slate-400 hover:text-slate-800 cursor-pointer focus:ring-0 p-0"
                            title="Change Role"
                          >
                            <option value="ADMIN">Admin</option>
                            <option value="EDITOR">Editor</option>
                            <option value="VOLUNTEER">Volunteer</option>
                            <option value="DONOR">Donor</option>
                            <option value="USER">User</option>
                          </select>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={isOperating}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                            user.isActive
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                          }`}
                          title={`Click to ${user.isActive ? "suspend" : "activate"}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.isActive ? "bg-emerald-600" : "bg-slate-400"
                            }`}
                          />
                          <span>{user.isActive ? "Active" : "Suspended"}</span>
                        </button>
                      </td>

                      {/* Contact & City */}
                      <td className="px-5 py-4 hidden md:table-cell text-xs text-slate-600 space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{user.phone || "—"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{user.city || "Vrindavan"}</span>
                        </div>
                      </td>

                      {/* Registered Date */}
                      <td className="px-5 py-4 hidden lg:table-cell text-xs text-slate-500 font-mono">
                        {new Date(user.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions Column */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reset Password Button */}
                          <button
                            onClick={() => {
                              setResetUserId(user.id);
                              setResetUserName(user.name);
                              setNewPassword("");
                              setResetModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Reset password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Delete User Button */}
                          <button
                            onClick={() => handleDeleteUser(user)}
                            disabled={isOperating}
                            className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete user account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW USER                                                    */}
      {/* ========================================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-prayas-rule space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-prayas-rule pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <UserPlus className="w-4 h-4" />
                </span>
                <h3 className="font-serif text-lg font-bold text-prayas-ink">
                  Create New User Account
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Banner */}
            {formErrors.general && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formErrors.general}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCreateUser} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhey Shyam Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-prayas-rule rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E5339]/20"
                  />
                </div>
                {formErrors.name && (
                  <span className="text-[11px] text-rose-600 mt-1 block">{formErrors.name}</span>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. coordinator@prayaspariwaar.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-prayas-rule rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E5339]/20"
                  />
                </div>
                {formErrors.email && (
                  <span className="text-[11px] text-rose-600 mt-1 block">{formErrors.email}</span>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-10 py-2 border border-prayas-rule rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E5339]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.password && (
                  <span className="text-[11px] text-rose-600 mt-1 block">{formErrors.password}</span>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Assign System Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-prayas-rule rounded-xl text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#2E5339]/20"
                >
                  <option value="ADMIN">ADMIN — Full system control, finances & user administration</option>
                  <option value="EDITOR">EDITOR — Publish dispatches, gallery photos & program updates</option>
                  <option value="VOLUNTEER">VOLUNTEER — Access field requests & volunteer portal</option>
                  <option value="USER">USER — Supporter mobile app access</option>
                </select>
              </div>

              {/* Phone & City Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="+91 99270 XXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-prayas-rule rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E5339]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    City / Center (Optional)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Vrindavan"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-prayas-rule rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E5339]/20"
                    />
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="pt-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-[#2E5339] focus:ring-[#2E5339] h-4 w-4"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Activate account immediately
                </label>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-prayas-rule flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-prayas-rule rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#2E5339] hover:bg-[#23432b] rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESET PASSWORD                                                     */}
      {/* ========================================================================= */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-prayas-rule space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-prayas-rule pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <h3 className="font-serif text-lg font-bold text-prayas-ink">
                  Reset Password for {resetUserName}
                </h3>
              </div>
              <button
                onClick={() => setResetModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-prayas-rule rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2E5339]/20"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-prayas-rule flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-prayas-rule rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetSubmitting || newPassword.length < 6}
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {resetSubmitting ? "Resetting..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
