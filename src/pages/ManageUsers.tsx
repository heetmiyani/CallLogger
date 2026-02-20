import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface StaffUser {
  id: number;
  email: string;
  name: string;
  role: "admin" | "staff";
  password: string;
}

export default function ManageUsers() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<StaffUser[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");

  if (user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="text-center text-red-600 font-semibold">
          Access Denied
        </div>
      </DashboardLayout>
    );
  }

  const fetchUsers = async () => {
    const res = await fetch("/api/staff");
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (!email || !password || !name) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    toast({
      title: "User Added",
      description: `${email} added successfully`,
    });

    setEmail("");
    setPassword("");
    setName("");
    setRole("staff");

    fetchUsers();
  };

  const handleDelete = async (id: number) => {
    await fetch("/api/staff", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    fetchUsers();
  };

  const handlePasswordUpdate = async (id: number) => {
    const newPassword = prompt("Enter new password");
    if (!newPassword) return;

    await fetch("/api/staff", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password: newPassword }),
    });

    fetchUsers();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>

        <Card>
          <CardHeader>
            <CardTitle>Add New User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            <Input placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <select
              className="w-full border rounded px-3 py-2"
              value={role}
              onChange={e => setRole(e.target.value as "admin" | "staff")}
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
            <Button onClick={handleAddUser}>Add User</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Users</CardTitle>
          </CardHeader>
          <CardContent>
            {users.map(u => (
              <div key={u.id} className="flex justify-between items-center border p-2 mb-2">
                <div>
                  <div>{u.email}</div>
                  <div className="text-sm text-muted-foreground">{u.role}</div>
                </div>
                <div className="space-x-2">
                  <Button size="sm" onClick={() => handlePasswordUpdate(u.id)}>Change Password</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(u.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
