import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ManageUsers() {
  const { users, addUser, updateUserPassword, deleteUser, user } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");

  // 🔒 Extra safety (route already protected)
  if (user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="text-center text-red-600 font-semibold">
          Access Denied
        </div>
      </DashboardLayout>
    );
  }

  const handleAddUser = () => {
    if (!email || !password || !name) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    addUser({ email, password, name, role });

    toast({
      title: "User Added",
      description: `${email} added successfully`,
    });

    setEmail("");
    setPassword("");
    setName("");
    setRole("staff");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Manage Users
          </h1>
          <p className="text-muted-foreground mt-1">
            Add, update, and manage system users
          </p>
        </div>

        {/* Add User */}
        <Card>
          <CardHeader>
            <CardTitle>Add New User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div>
              <Label>Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="text"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <div>
              <Label>Role</Label>
              <select
                className="w-full border rounded px-3 py-2"
                value={role}
                onChange={e => setRole(e.target.value as "admin" | "staff")}
              >
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            <Button onClick={handleAddUser}>Add User</Button>
          </CardContent>
        </Card>

        {/* Existing Users */}
        <Card>
          <CardHeader>
            <CardTitle>Existing Users</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-muted">
                <tr>
                  <th className="border px-3 py-2">Email</th>
                  <th className="border px-3 py-2">Name</th>
                  <th className="border px-3 py-2">Role</th>
                  <th className="border px-3 py-2">Password</th>
                  <th className="border px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.email}>
                    <td className="border px-3 py-2">{u.email}</td>
                    <td className="border px-3 py-2">{u.name}</td>
                    <td className="border px-3 py-2 capitalize">{u.role}</td>
                    <td className="border px-3 py-2">{u.password}</td>
                    <td className="border px-3 py-2 space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateUserPassword(
                            u.email,
                            prompt("Enter new password") || u.password
                          )
                        }
                      >
                        Change Password
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteUser(u.email)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-4 text-muted-foreground"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
